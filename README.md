# MD Core Docs

Markdown দিয়ে বানানো একটি personal documentation hub. Database design, SQL, backend concepts, memory management এবং engineering notes এক জায়গায় সাজিয়ে পড়ার জন্য এই site তৈরি করা হয়েছে।

প্রজেক্টটি **Next.js 16**, **React 19**, **Tailwind CSS v4**, **MDX/Markdown**, **Framer Motion** এবং **Lucide React** ব্যবহার করে বানানো।

## কী আছে এখানে

- `content/` ফোল্ডারের `.md` ফাইল থেকে automatic docs page তৈরি হয়
- Home page-এ সব document card হিসেবে দেখা যায়
- Category filter এবং pagination আছে
- প্রতিটি docs page-এ sidebar, table of contents এবং styled markdown content আছে
- Markdown frontmatter থেকে title, description এবং category নেওয়া হয়
- Static route generation ব্যবহার করা হয়েছে, তাই docs দ্রুত load হয়

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- MDX rendering with `next-mdx-remote`
- Frontmatter parsing with `gray-matter`
- Animation with `framer-motion`
- Icons with `lucide-react`

## Project Structure

```txt
app/
  page.tsx              # Home page with docs list, category filter, pagination
  docs/[slug]/page.tsx  # Individual documentation page
  layout.tsx            # Root layout and metadata
  globals.css           # Global styles

components/
  AnimatedGrid.tsx      # Animated document grid

content/
  *.md                  # Markdown documentation files

lib/
  markdown.ts           # Markdown file loader and frontmatter parser
```

## Local Setup

প্রথমে dependency install করুন:

```bash
npm install
```

Development server চালু করুন:

```bash
npm run dev
```

তারপর browser-এ খুলুন:

```txt
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Local development server চালায়।

```bash
npm run build
```

Production build তৈরি করে।

```bash
npm run start
```

Production build locally run করে।

```bash
npm run lint
```

ESLint দিয়ে code check করে।

## নতুন Document যোগ করার নিয়ম

`content/` ফোল্ডারে নতুন `.md` ফাইল তৈরি করুন। ফাইলের নামই URL slug হবে।

উদাহরণ:

```txt
content/system-design.md
```

এই ফাইলটি পাওয়া যাবে:

```txt
/docs/system-design
```

প্রতিটি markdown file-এর শুরুতে frontmatter দিন:

```md
---
title: "System Design Notes"
description: "Scalability, caching, database, queue এবং distributed system নিয়ে notes."
category: "Backend"
---

# System Design Notes

এখানে আপনার documentation লিখুন।
```

## Current Documents

- Backend Concepts
- ডাটাবেজ ডিজাইন ও SQL কনসেপ্ট
- ডকুমেন্টেশন ইঞ্জিন গাইড
- Memory Management

## Deployment

Production build check করতে:

```bash
npm run build
```

Next.js support করে এমন যেকোনো platform-এ deploy করা যাবে, যেমন Vercel বা নিজের Node.js server।

## Notes

এই project মূলত personal knowledge base হিসেবে তৈরি। নতুন topic যোগ করতে শুধু `content/` ফোল্ডারে markdown file রাখলেই site automatically সেটি index করবে।
