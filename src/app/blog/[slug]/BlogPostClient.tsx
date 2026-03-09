"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";

interface Props {
  post: BlogPost;
  related: BlogPost[];
}

function parseContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-xl font-bold mt-8 mb-3 text-gray-900">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-gray-900">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-3xl font-black mt-10 mb-4 text-gray-900">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(<ul key={"ul-" + i} className="my-4 space-y-1">{items.map((item, j) => <li key={j} className="ml-4 text-gray-700 list-disc list-inside">{formatInline(item)}</li>)}</ul>);
      continue;
    } else if (/^\d+\./.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ""));
        i++;
      }
      elements.push(<ol key={"ol-" + i} className="my-4 space-y-1 list-decimal list-inside">{items.map((item, j) => <li key={j} className="ml-4 text-gray-700">{formatInline(item)}</li>)}</ol>);
      continue;
    } else if (line.startsWith("| ")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) {
          rows.push(lines[i].split("|").filter(c => c.trim() !== "").map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        elements.push(
          <div key={"table-" + i} className="overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {rows[0].map((cell, j) => <th key={j} className="px-4 py-2 text-left font-semibold text-gray-700 border border-gray-200">{cell}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="even:bg-gray-50">
                    {row.map((cell, ci) => <td key={ci} className="px-4 py-2 text-gray-600 border border-gray-200">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    } else if (line.trim() !== "") {
      elements.push(<p key={i} className="mb-4 text-gray-700 leading-relaxed">{formatInline(line)}</p>);
    }
    i++;
  }
  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function BlogPostClient({ post, related }: Props) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl || "https://referaus.com/blog/" + post.slug);
    const text = encodeURIComponent(post.title);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
    };
    if (links[platform]) window.open(links[platform], "_blank", "width=600,height=400");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || "https://referaus.com/blog/" + post.slug);
      alert("Link copied!");
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/blog" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
            ? Back to Resources
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">{post.category}</span>
            <span className="text-xs text-gray-400">{post.date}</span>
            <span className="text-xs text-gray-400">�</span>
            <span className="text-xs text-gray-400">{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">R</div>
            <span className="text-sm font-medium text-gray-700">{post.author}</span>
          </div>
        </motion.div>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          {parseContent(post.content)}
        </motion.article>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-10 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-4">Share this article</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
              Twitter / X
            </button>
            <button onClick={() => handleShare("linkedin")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
              LinkedIn
            </button>
            <button onClick={() => handleShare("facebook")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium transition-all">
              Facebook
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all">
              Copy link
            </button>
          </div>
        </motion.div>

        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <Link key={rel.slug} href={"/blog/" + rel.slug} className="block group rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-500/40 hover:shadow-md transition-all">
                  <span className="text-xs font-medium text-blue-600 mb-2 block">{rel.category}</span>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">{rel.title}</h3>
                  <span className="text-xs text-gray-400">{rel.readTime}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
            ? View all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
