export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  coverImage: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-the-ndis-complete-guide",
    title: "What Is the NDIS? A Complete Guide for Participants and Families",
    excerpt: "The National Disability Insurance Scheme (NDIS) is Australia''s landmark disability support program. This comprehensive guide explains how it works, who is eligible, and how to get the most from your plan.",
    date: "5 Mar 2026",
    author: "ReferAus Team",
    category: "Guides",
    readTime: "10 min read",
    coverImage: "/blog/ndis-guide-cover.jpg",
    tags: ["NDIS", "eligibility", "participants", "getting started"],
    content: `## What Is the NDIS?

The National Disability Insurance Scheme (NDIS) is a federal government program that provides funding and support to Australians under the age of 65 who have a permanent and significant disability. Launched in 2013 and progressively rolled out across Australia, the NDIS now supports over 650,000 Australians, giving them choice and control over how they use their disability supports.

Unlike older, block-funded models where services were allocated to organisations, the NDIS is **person-centred**: each eligible participant receives an individualised plan with funding tied directly to their goals and needs.

## Who Is Eligible for the NDIS?

To access the NDIS you must meet all of the following criteria:

- **Age:** Under 65 years old when you first apply
- **Residency:** An Australian citizen, permanent resident, or Protected Special Category Visa holder
- **Location:** Live in Australia (coverage is now nationwide)
- **Disability:** Have a permanent and significant disability caused by an impairment (physical, intellectual, psychosocial, sensory, cognitive or neurological) that substantially reduces your ability to participate in everyday activities

The NDIS also has an **Early Childhood approach** for children under 9 who have a developmental delay or disability, providing early intervention supports without requiring a formal access decision.

## How Does the NDIS Work?

### Step 1: Access Request
You or a person representing you submits an Access Request to the NDIA (National Disability Insurance Agency). This involves evidence from treating professionals describing your disability and its functional impacts.

### Step 2: Planning Meeting
If deemed eligible, you will have a planning meeting with an NDIA planner or a Local Area Coordinator (LAC). During this meeting you discuss your goals, daily living needs, informal supports, and what funded supports would help you live a more independent life.

### Step 3: Your NDIS Plan
After the meeting, the NDIA develops your individualised plan. This document outlines your goals, the funded supports you are approved for, and how the funding is managed.

### Step 4: Implementing Your Plan
Once your plan is approved, you start using your funding to engage providers. Depending on your plan management type, you or your plan manager will pay providers from your NDIS budget.

### Step 5: Plan Review
NDIS plans are typically reviewed annually. Reviews are an opportunity to increase funding if your needs have grown, add new supports, or adjust your goals.

## What Does the NDIS Fund?

NDIS funding is split into three support budget categories:

1. **Core Supports** — Day-to-day assistance like personal care, domestic help, community participation, and consumables
2. **Capacity Building Supports** — Helps you build independence and skills, including support coordination, employment supports, and improved daily living
3. **Capital Supports** — Assistive technology (e.g., wheelchairs, communication devices) and home or vehicle modifications

NDIS funding is not a cash payment into your bank account — it is allocated funding that must be spent on reasonable and necessary supports related to your disability.

## What Doesn''t the NDIS Fund?

The NDIS funds supports that are additional to what mainstream services provide. It does not fund:
- Medical or health treatments covered by Medicare
- Education supports provided by schools
- Day-to-day living costs unrelated to your disability
- Supports that are not "reasonable and necessary"

## Tips for Getting the Most From Your NDIS Plan

1. **Be specific about your goals** — Vague goals lead to vague funding
2. **Bring supporting evidence** — Reports from your GP, OT, physio, or specialists carry weight
3. **Understand your funding categories** — Core is the most flexible; Capital and Capacity Building have stricter rules
4. **Ask for a support coordinator** — If your situation is complex, they can help you navigate providers
5. **Keep records** — Track how you spend your NDIS funding
6. **Review regularly** — Don''t wait until your annual review if something isn''t working

## Getting Help

- **NDIS website:** ndis.gov.au
- **NDIS contact centre:** 1800 800 110
- **Disability Advocacy NSW:** Provides free advocacy for people having difficulty with their NDIS access or plan
- **ReferAus:** Search local providers and read real reviews from other participants in your area`,
  },
];
