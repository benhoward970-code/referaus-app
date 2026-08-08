-- Review moderation: reviews are no longer live the instant they're submitted.
-- Existing reviews (seed data, already public) are grandfathered in as approved.
-- New reviews default to 'pending' and only become visible once an admin approves them.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text;

UPDATE reviews SET status = 'approved' WHERE status IS NULL;

ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE reviews ALTER COLUMN status SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE reviews ADD CONSTRAINT reviews_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Public can only ever SELECT approved reviews now (was: everyone / true).
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Approved reviews viewable by everyone" ON reviews;
CREATE POLICY "Approved reviews viewable by everyone" ON reviews FOR SELECT USING (status = 'approved');

-- Provider rating/review_count must only reflect approved reviews, and must
-- recompute on UPDATE (approve/reject) and DELETE too, not just INSERT.
CREATE OR REPLACE FUNCTION update_provider_rating() RETURNS TRIGGER AS $$
DECLARE
  target_slug text := COALESCE(NEW.provider_slug, OLD.provider_slug);
BEGIN
  UPDATE providers SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE provider_slug = target_slug AND status = 'approved'), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE provider_slug = target_slug AND status = 'approved')
  WHERE slug = target_slug;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_update_rating ON reviews;
CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
