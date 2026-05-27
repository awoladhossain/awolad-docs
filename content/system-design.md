---
title: "System Design Handbook"
description: "১০+ বছরের রিয়েল-ওয়ার্ল্ড এক্সপেরিয়েন্স থেকে তৈরি ২০টি হাই-পারফরম্যান্স সিস্টেম ডিজাইন ও প্র্যাক্টিক্যাল ইমপ্লিমেন্টেশন গাইড।"
category: "Architecture"
---

# 🌐 System Design Masterclass: 10-Year Architect Guide

স্বাগতম! এই হ্যান্ডবুকটি কোনো তাত্ত্বিক ডক নয়। এটি ১০+ বছরের রিয়েল-ওয়ার্ল্ড লার্জ স্কেল ডিস্ট্রিবিউটেড সিস্টেম আর্কিটেক্ট করার এক্সপেরিয়েন্স এবং প্রোডাকশন ফেইলিউর থেকে শেখা লেসন বুক। আমরা এখানে ২০টি ক্লাসিক ও মডার্ন সিস্টেম ডিজাইন শিখবো। 

শুধুমাত্র হাই-লেভেল ব্লক ডায়গ্রাম এঁকে আমরা থেমে থাকবো না। প্রতিটা টপিকের পেছনে **কীভাবে চিন্তা করতে হয় (Mental Framework)**, **ক্যালকুলেশন কীভাবে করতে হয় (Back-of-the-envelope Estimation)**, এবং **কোডে কীভাবে রিফ্লেক্ট করতে হয় (Practical Code Snippets)** — সবগুলো আমরা এই ইন্টারেক্টিভ গাইডে কাভার করবো।

---

## 🛠️ The 10-Year Architect's Framework

যেকোনো সিস্টেম ডিজাইন ইন্টারভিউ বা রিয়েল-ওয়ার্ল্ড প্রজেক্ট রিকোয়ারমেন্ট হ্যান্ডেল করার জন্য আমি এই **৫-ধাপের আর্কিটেকচারাল ফ্রেমওয়ার্ক** ব্যবহার করি। এটি আমাদের পুরো হ্যান্ডবুকের কোর স্ট্রাকচার হিসেবে কাজ করবে:

```mermaid
flowchart LR
    R[1. Requirements & Scope] --> E[2. Capacity Estimation]
    E --> A[3. API Design & Schema]
    A --> H[4. High-Level Design]
    H --> D[5. Deep Dive & Scaling]
    
    style R fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style E fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style A fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style H fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff
    style D fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
```

1. **Requirements Gathering (স্কোপ ডিটেকশন):** 
   - **Functional:** সিস্টেমটি কী কী কাজ করবে (যেমন: ইউজার ইউআরএল শর্ট করবে)।
   - **Non-Functional:** সিস্টেমের পারফরম্যান্স টার্গেট কী (High Availability, Low Latency, Read-Heavy vs Write-Heavy)।
2. **Back-of-the-envelope Estimation (ক্যাপাসিটি হিসাব):**
   - কত QPS (Queries Per Second) আসবে?
   - ১০ বছরে কত পিটাবাইট ডেটা স্টোর করতে হবে?
   - ব্যান্ডউইথ রিকোয়ারমেন্ট কেমন হবে?
3. **API & Data Model Design (চুক্তি ও স্কিমা):**
   - এপিআই এন্ডপয়েন্ট ডিজাইন (Input, Output, HTTP Status Codes)।
   - ডাটাবেস স্কিমা (SQL vs NoSQL) এবং কুয়েরি প্যাটার্ন।
4. **High-Level Design (বক্স আর্কিটেকচার):**
   - ক্লায়েন্ট থেকে ডাটাবেস পর্যন্ত এন্ড-টু-এন্ড ট্রাফিক ফ্লো (DNS, Load Balancer, CDN, API Gateway, App Servers, Cache, Database)।
5. **Deep Dive & Scaling Bottlenecks (সিনিয়র লেভেল সল্যুশন):**
   - সিঙ্গেল পয়েন্ট অফ ফেইলিউর (SPOF) রিমুভ করা।
   - ডিস্ট্রিবিউটেড লকিং, ক্যাশ স্ট্যাম্পিড, ডিবি শার্ডিং এবং ডাটা কনসিস্টেন্সি হ্যান্ডলিং।

---

## 📚 Table of Contents: The 20-Chapter Roadmap

আমরা প্রতিটা চ্যাপ্টারকে ইন্টারেক্টিভলি শেষ করবো। নিচের ইনডেক্স থেকে কারেন্ট প্রোগ্রেস ট্র্যাক করতে পারবে:

| Chapter | Topic | Status | Focus Core Concept |
| :--- | :--- | :---: | :--- |
| **01** | [URL Shortener (TinyURL)](#-chapter-01-url-shortener-tinyurl-scale-10b-links) | 🟢 **Active** | Snowflake ID, Base62 Encoding, Redis, DB Indexing |
| **02** | [YouTube & Netflix (Video Streaming)](#-chapter-02-youtube--netflix-video-streaming-platform) | 🟢 **Active** | Transcoding, CDN Edge, HLS/DASH Streaming, Blob Store |
| **03** | [High-Concurrency E-Commerce (Amazon)](#-chapter-03-high-concurrency-e-commerce-system) | 🟢 **Active** | Flash Sales, Redis Distributed Locks, Saga Pattern, Idempotency |
| **04** | [WhatsApp & Messenger](#-chapter-04-whatsapp--messenger-real-time-chat-engine) | 🟢 **Active** | WebSockets, Message Gateway, Cassandra Store, Connection Registry |
| **05** | [Uber & Grab (Ride-Sharing)](#-chapter-05-uber--grab-ride-sharing-geospatial-engine) | 🟢 **Active** | Geospatial Indexing (Geohash/H3), Quadtree, Pub/Sub Engine |
| **06** | [Twitter/X (News Feed & Timeline)](#-chapter-06-twitterx-news-feed--timeline-fanout-engine) | 🟢 **Active** | Fanout-on-write vs Fanout-on-read, Push vs Pull |
| **07** | [Ticketmaster (Ticketing Engine)](#-chapter-07-ticketmaster-high-concurrency-booking-engine) | 🟢 **Active** | High-Concurrency Booking, Distributed Locking, Queueing System |
| **08** | [Google Drive / Dropbox](#-chapter-08-google-drive--dropbox-distributed-file-storage-engine) | 🟢 **Active** | Chunk-based uploads, Metadata Sync, Keep-Alive/Long Polling |
| **09** | [Web Crawler (Search Engine Indexer)](#-chapter-09-web-crawler-search-engine-indexer) | 🟢 **Active** | BFS Graph Traversal, Robots.txt Parser, Deduplication Pipeline |
| **10** | Distributed Notification System | 🔒 *Locked* | Priority Queues (RabbitMQ/Kafka), Rate Limiting, Idempotency |
| **11** | API Gateway & Distributed Rate Limiter | 🔒 *Locked* | Token Bucket Alg, Redis Lua Scripting, Edge Auth Integration |
| **12** | Airbnb (Hotel/Home Booking) | 🔒 *Locked* | Double Booking Prevention, Temporal Querying, Geo-search |
| **13** | Robinhood / Stock Trading Engine | 🔒 *Locked* | Matching Engine, LMAX Disruptor, In-memory State, Low Latency |
| **14** | Distributed Cache (Redis Internals) | 🔒 *Locked* | Replication, Sentinel, Clustering & Partitioning, Eviction (LRU) |
| **15** | Metrics & Monitoring System (Prometheus) | 🔒 *Locked* | Time Series DB (TSDB), Pull vs Push, Metrics Aggregation |
| **16** | Ad Click Aggregator | 🔒 *Locked* | Real-time Streaming, Apache Flink, Kafka, MapReduce |
| **17** | Auto-complete / Typeahead Search | 🔒 *Locked* | Trie Data Structure, Frequency Aggregation, Cache Optimization |
| **18** | Tinder / Geosocial Matchmaker | 🔒 *Locked* | Recommendation Engines, Geopoint Queries, Profile Caching |
| **19** | Distributed Unique ID Generator | 🔒 *Locked* | Snowflake Algorithm, Ticket Server, UUID Collisions |
| **20** | Stripe-like Payment Integration Engine | 🔒 *Locked* | Ledger Reconciliation, Retry Policies, Double Entry Bookkeeping |

> [!TIP]
> আমরা প্রথম ৩টি কোর চ্যাপ্টার সম্পূর্ণ প্রডাকশন-গ্রেড আর্কিটেকচার ও কোডসহ বিস্তারিত নিচে যুক্ত করেছি। পরবর্তী চ্যাপ্টারগুলো আমরা একের পর এক রিয়েল-টাইম আলোচনা করে এবং রিকোয়ারমেন্ট কাস্টমাইজ করে আনলক করবো!

---

## 📖 Chapter 01: URL Shortener (TinyURL) [Scale: 10B Links]

এটি সিস্টেম ডিজাইনের "Hello World"। তবে এর গভীরে গেলে ডিস্ট্রিবিউটেড আইডির চমৎকার ইঞ্জিনিয়ারিং বের হয়ে আসে।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ইউজার একটি লং ইউআরএল সাবমিট করলে সিস্টেম একটি শর্ট ইউআরএল রিটার্ন করবে (যেমন: `https://tiny.com/aB3x9Z`)।
  - শর্ট ইউআরএলে হিট করলে ইউজার ইনস্ট্যান্টলি আসল লং ইউআরএলে রিডাইরেক্ট হবে।
  - কাস্টম অ্যালিয়াস দিতে পারবে (ঐচ্ছিক)।
  - শর্ট লিংকের এক্সপায়ারি ডেট থাকবে।
- **Non-Functional:**
  - **High Availability:** রিডাইরেকশন কোনোভাবেই ফেইল করা যাবে না (৯৯.৯৯% আপটাইম)।
  - **Low Latency:** রিডাইরেকশন লেটেন্সি < ৫০ মিলি-সেকেন্ড হতে হবে।
  - **Write-Heavy / Read-Heavy:** এটি অত্যন্ত **Read-Heavy** সিস্টেম (Read:Write Ratio = 100:1)।

### ২. Back-of-the-envelope Estimation
ধরুন, আমাদের সিস্টেমে প্রতি মাসে **১০০ মিলিয়ন (100M)** নতুন শর্ট লিংক তৈরি হয়।
- **Write QPS:**
  * `Write QPS = 100,000,000 / (30 days * 24 hours * 3600 seconds) ≈` **40 writes/sec**
- **Read QPS (100:1 Ratio):**
  * `Read QPS = 40 writes/sec * 100 =` **4,000 reads/sec**
- **Storage for 10 Years:**
  প্রতিটি রেকর্ড (Long URL, Short URL, ID, Created_At, Expire_At) এভারেজ ৫০০ বাইট স্টোরেজ নেয়।
  * `Total Records = 100M * 12 months * 10 years =` **12 Billion records**
  * `Total Storage = 12B * 500 bytes ≈` **6 Terabytes**
- **Cache Memory (80-20 Rule):**
  ডেইলি ট্রাফিকের ২০% হট লিংক ক্যাশে রাখবো।
  * `Daily Reads = 4,000 reads/sec * 86,400 seconds ≈` **345 Million reads/day**
  * `Memory Required = 345M * 20% hot links * 500 bytes ≈` **34.5 GB**

### ৩. API & Database Schema Design
আমরা দুটি সিম্পল REST এপিআই ডিজাইন করবো:
- **Create Short Link:**
  `POST /api/v1/shorten`
  ```json
  // Request
  {
    "long_url": "https://medium.com/engineering/how-we-scaled-our-databases-to-10m-users",
    "custom_alias": "dbscale", // Optional
    "expires_at": "2030-01-01T00:00:00Z" // Optional
  }
  // Response (201 Created)
  {
    "short_url": "https://tiny.com/dbscale",
    "short_key": "dbscale"
  }
  ```
- **Redirect Link:**
  `GET /{short_key}` -> HTTP status `302 Found` (Redirect)
  *(নোট: আমরা 301 Permanent Redirect ব্যবহার করবো না, কারণ 302 ব্যবহার করলে প্রতিটা হিট আমাদের ব্যাকএন্ড সার্ভারে আসে, যার ফলে আমরা নিখুঁত ক্লিক অ্যানালিটিক্স ট্র্যাক করতে পারি। 301 দিলে ব্রাউজার নিজের ক্যাশে রেখে দেয় এবং ব্যাকএন্ডে রিকোয়েস্ট আসে না।)*

#### Database Selection & Schema
যেহেতু আমাদের কোনো কমপ্লেক্স রিলেশন বা জয়েন কোয়েরি নেই এবং সিস্টেমে বিলিয়ন বিলিয়ন রো স্টোর হবে, একটি নোএসকিউএল কী-ভ্যালু বা ওয়াইড-কলাম ডাটাবেস (যেমন **Cassandra** বা **DynamoDB**) স্টোরেজ ও হরাইজন্টাল স্কেলিংয়ের জন্য বেস্ট।

```sql
-- Conceptual Schema (Cassandra/Postgres representation)
CREATE TABLE url_mappings (
    short_key VARCHAR(10) PRIMARY KEY,
    long_url VARCHAR(2048) NOT NULL,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    user_id VARCHAR(64)
);
```

### ৪. High-Level Architecture
সিস্টেমের হাই-লেভেল ট্রাফিক ফ্লো নিচে চিত্রায়িত করা হলো:

```mermaid
flowchart TD
    BrowserClient["Browser Client"] -->|1. GET Short URL| DNSResolver["DNS Resolver"]
    DNSResolver -->|2. Resolve IP| LoadBalancer["Load Balancer"]
    LoadBalancer -->|3. Route Request| AppServer["App Servers"]
    AppServer -->|4. Read Cache| CacheRedis["Redis Cache (RAM)"]
    
    CacheRedis -->|5. Cache Hit - Return URL| AppServer
    CacheRedis -->|6. Cache Miss - Query DB| DbCassandra["Cassandra DB (Disk)"]
    DbCassandra -->|7. Set Cache and Return| AppServer
    
    AppServer -->|8. HTTP 302 Redirect| BrowserClient
    
    style BrowserClient fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style CacheRedis fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style DbCassandra fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

### ৫. Deep Dive: Unique ID / Key Generator Strategy
ইউনিক শর্ট কী (যেমন `aB3x9Z`) কীভাবে জেনারেট করব? এটিই ইন্টারভিউয়ের মূল আকর্ষণ।
আমরা যদি **Base62 Encoding** (`[a-z, A-Z, 0-9]` মোট ৬২টি ক্যারেক্টার) ব্যবহার করি, তবে ৭ ক্যারেক্টারের ইউনিক কী দিয়ে আমরা কতগুলো ইউনিক কম্বিনেশন তৈরি করতে পারবো?
* `62⁷ ≈ 3.5 Trillion unique keys`
যা আমাদের ১০ বছরের টার্গেটের (১২ বিলিয়ন) চেয়ে অনেক বেশি!

#### অপশন A: MD5 / Cryptographic Hash (ফেইলর প্রন)
লং ইউআরএলকে MD5 দিয়ে হ্যাশ করে প্রথম ৭ ক্যারেক্টার নেওয়া।
- **সমস্যা:** হ্যাশ কলিশন (Collision) হবেই। ২ জন ইউজার ভিন্ন ডোমেইন দিলে একই শর্ট কি জেনারেট হতে পারে। এটি হ্যান্ডেল করতে ডাটাবেসে চেক করতে হবে, যা অত্যন্ত স্লো।

#### অপশন B: Base62 Conversion with Auto-Increment (স্কেলিং প্রবলেম)
ডাটাবেসের অটো-ইনক্রিমেন্ট আইডি (যেমন ১, ২, ৩...) নিয়ে তাকে Base62-তে কনভার্ট করা।
- **সমস্যা:** ডিস্ট্রিবিউটেড ডাটাবেসে মাল্টিপল নোড থাকলে অটো-ইনক্রিমেন্ট কনফ্লিক্ট করবে। সিঙ্গেল ডাটাবেস রাখলে রাইট পারফরম্যান্সে Bottleneck তৈরি হবে।

#### অপশন C: Distributed Snowflake ID Generator (Staff Architect Solution)
একটি ডেডিকেটেড আইডি জেনারেট সার্ভিস ব্যবহার করা।
যেমন **Twitter Snowflake** যা ৬৪ বিটের ইউনিক আইডি জেনারেট করে:
- **Timestamp (41 bits):** এপোচ টাইম মিলি-সেকেন্ডে।
- **Machine/Worker ID (10 bits):** ১০২৪টি আলাদা সার্ভার নোড হ্যান্ডেল করতে পারে।
- **Sequence Number (12 bits):** প্রতি সার্ভার প্রতি মিলি-সেকেন্ডে ৪০৯৬টি ইউনিক আইডি তৈরি করতে পারে।

আমরা এই ইউনিক ৬৪-বিট ইন্টিজার আইডিটি জেনারেট করে সরাসরি **Base62**-তে এনকোড করে ফেলবো। যেহেতু আইডি ইউনিক, তাই কোনো ডুপ্লিকেট কি জেনারেট হবে না এবং ডাটাবেস কলিশন চেক করার জিরো ওভারহেড!

### 💻 Practical TypeScript Implementation
নিচে একটি প্রোডাকশন-রেডি Base62 এনকোডার এবং ডিস্ট্রিবিউটেড আইডি কনভার্টার কোড দেওয়া হলো:

```typescript
// utils/base62.ts
export class Base62Encoder {
  private static readonly CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static readonly BASE = 62;

  /**
   * ইন্টিজার আইডিকে Base62 স্ট্রিংয়ে কনভার্ট করে
   */
  public static encode(num: bigint): string {
    if (num === 0n) return this.CHARS[0];
    
    let result = "";
    let temp = num;
    
    while (temp > 0n) {
      const remainder = Number(temp % BigInt(this.BASE));
      result = this.CHARS[remainder] + result;
      temp = temp / BigInt(this.BASE);
    }
    
    return result;
  }

  /**
   * Base62 স্ট্রিংকে ডিকোড করে অরিজিনাল ইন্টিজারে ব্যাক করে
   */
  public static decode(str: string): bigint {
    let result = 0n;
    
    for (let i = 0; i < str.length; i++) {
      const charCodeIndex = this.CHARS.indexOf(str[i]);
      if (charCodeIndex === -1) {
        throw new Error(`Invalid Base62 character: ${str[i]}`);
      }
      result = result * BigInt(this.BASE) + BigInt(charCodeIndex);
    }
    
    return result;
  }
}

// Example usage mimicking Snowflake ID Conversion
const dummySnowflakeId = 17849302919323146n; // 64-bit distributed integer
const shortKey = Base62Encoder.encode(dummySnowflakeId);
console.log(`Generated Short Key: ${shortKey}`); // Output: e.g., 'C4g6yZ'
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

রিয়েল-ওয়ার্ল্ড লার্জ স্কেল প্রোডাকশনে এই ৩টি ক্রিটিক্যাল এজ কেস ফেস করতে হবে:

#### ১. Clock Skew in Distributed Snowflake Generator
Snowflake ID অ্যালগরিদম প্রতিটি মেশিনের ইন্টারনাল সিস্টেম ক্লকের ওপর নির্ভরশীল। যেহেতু নেটওয়ার্ক সিনক্রোনাইজেশনের জন্য NTP (Network Time Protocol) ব্যাকগ্রাউন্ডে টাইম অ্যাডজাস্ট করে, অনেক সময় সিস্টেমের ঘড়ি পেছনে চলে যেতে পারে (Clock Skew)। ঘড়ি পেছনে গেলে ডুপ্লিকেট আইডি জেনারেট হওয়ার রিস্ক থাকে।
* **মিটিগেশন:** আইডি জেনারেটর কোডে `lastTimestamp` ভ্যারিয়েবল ট্র্যাক রাখতে হবে। যদি বর্তমান টাইমস্ট্যাম্প `lastTimestamp` এর চেয়ে কম হয়, তবে সিস্টেম ক্লক সিঙ্ক হওয়া পর্যন্ত রিকোয়েস্ট ব্লক করে ওয়েট করতে হবে অথবা এরর থ্রো করতে হবে (e.g., `Clock moved backwards. Refusing to generate id`).

#### ২. Custom Alias Collision in High Concurrency
যদি ২ জন ইউজার একই কাস্টম অ্যালিয়াস (যেমন `my-custom-link`) একই মিলি-সেকেন্ডে তৈরি করতে ট্রাই করে, তবে ডাটাবেসে রিকোয়েস্ট যাওয়ার পর কনফ্লিক্ট ধরা পড়বে যা ডাটাবেসকে অতিরিক্ত লক করবে।
* **মিটিগেশন:** **Distributed Lock with Redis SETNX (Set if Not Exists)**। ডাটাবেস রাইট করার আগে আমরা Redis-এ অ্যালিয়াসটির কী দিয়ে একটি শর্ট-লাইভড লক নিবো। 
  `redis.set(alias, "LOCK", "NX", "EX", 5)`
  লক সাকসেসফুল হলে আমরা Cassandra-তে ডেটা রাইট করব। যদি লক ফেইল করে (অর্থাৎ অলরেডি কেউ নিয়ে নিয়েছে), তবে আমরা সাথে সাথেই ডাটাবেসে হিট না করে `409 Conflict` এরর রিটার্ন করব।

#### ৩. Clean-up of Expired Links (Lazy vs Active Expiration)
আমাদের সিস্টেমে ১০ বছরে ১২ বিলিয়ন লিংক জমবে। অনেক লিংকেরই এক্সপায়ারি ডেট ওভার হয়ে যাবে। এগুলো ডাটাবেস থেকে ডিলিট না করলে বিলিয়ন বিলিয়ন ডেড ডেটা স্টোরেজ ও ইনডেক্স মেমোরি নষ্ট করবে।
* **Lazy Expiration (Passive):** যখন কোনো ইউজার কোনো লিংকে ক্লিক করবে, ব্যাকএন্ড লজিক দেখবে সেটির `expires_at < current_time` কিনা। যদি এক্সপায়ার হয়ে থাকে, আমরা সাথে সাথেই ডাটাবেস ও ক্যাশ থেকে এটি ডিলিট করে দিব এবং ইউজারকে `404 Not Found` দেখাবো।
* **Active Expiration (Background Worker):** ডাটাবেসের (যেমন Cassandra) বিল্ট-ইন **TTL (Time To Live)** ফিচার ব্যবহার করা বেস্ট প্র্যাকটিস। এতে ডেটা ইনসার্ট করার সময়ই ডেটা অটোমেটিক এক্সপায়ার হয়ে ডাটাবেস লেয়ারেই ডিলিট হয়ে যায়। কোনো এক্সট্রা ব্যাকগ্রাউন্ড ক্রন জব বা ডিলিট কোয়েরি লেখার প্রয়োজন হয় না।

---

## 📖 Chapter 02: YouTube & Netflix (Video Streaming Platform)

ভিডিও স্ট্রিমিং আর্কিটেকচার সাধারণ ওয়েব অ্যাপের চেয়ে সম্পূর্ণ আলাদা। এখানে রাইট ট্রাফিক (ভিডিও আপলোড) এবং রিড ট্রাফিক (প্লেব্যাক) সম্পূর্ণ ভিন্ন পাইপলাইনে চলে।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ইউজার ভিডিও আপলোড করতে পারবে।
  - ইউজার যেকোনো ডিভাইসে (মোবাইল, ডেস্কটপ, লো-ব্যান্ডউইথ) স্মুথলি ভিডিও প্লে করতে পারবে।
  - ভিউ কাউন্ট, লাইক, এবং রিয়েল-টাইম কমেন্ট সিস্টেম থাকবে।
- **Non-Functional:**
  - **High Scalability:** লাখ লাখ ইউজার একসাথে ভিডিও দেখবে (High Concurrent Viewers)।
  - **Zero Buffer (Low Latency):** প্লেব্যাক স্টার্ট হতে দেরি হওয়া যাবে না।
  - **Reliable Storage:** হাই-কোয়ালিটি ভিডিও ড্রপ বা লস করা যাবে না।

### ২. Video Transcoding & Playback Pipeline (ভিজুয়ালাইজেশন)

ভিডিও আপলোডের পর র ফাইলটি সরাসরি প্লে করা যায় না। এটিকে শত শত ফরম্যাট ও রেজোলিউশনে কনভার্ট করতে হয়।

```mermaid
flowchart TD
    subgraph Upload [Upload Pipeline]
        RawVideo[User Raw Video] -->|Upload| WebServer[API Gateway / Web Server]
        WebServer -->|File Storage| TempS3[Temporary S3 Bucket]
        TempS3 -->|Trigger Job| Transcoder[Transcoding Service Engine]
        
        Transcoder -->|Resolution Split| Res1080[1080p MP4/H.264]
        Transcoder -->|Resolution Split| Res720[720p H.264]
        Transcoder -->|Resolution Split| Res360[360p H.264]
        
        Res1080 -->|Segmenting| Chunking[Chunking Service: 4s segments]
        Res720 -->|Segmenting| Chunking
        Res360 -->|Segmenting| Chunking
        
        Chunking -->|Generate Playlist| Manifest[Create HLS .m3u8 Master Playlists]
        Manifest -->|Upload Final| RealS3[Production Storage S3]
    end

    subgraph Playback [Playback Pipeline]
        RealS3 -->|Geo-Replication| CDN[Content Delivery Network: Cloudflare Edge]
        Client[Viewer Device] -->|Request Playback| CDN
    end
    
    style RawVideo fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style RealS3 fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style CDN fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style Client fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

### 🎯 Core Architecture Breakdown

#### A. Video Upload & Transcoding (অ্যাসিনক্রোনাস প্রসেস)
1. **Raw Upload:** ইউজার ভিডিও আপলোড করলে তা প্রথমে একটি টেম্পোরারি স্টোরেজে যায়।
2. **Transcoding (ভিডিও রূপান্তর):** র ফাইলটিকে বিভিন্ন বিটরেট (Bitrate) এবং রেজোলিউশনে (360p, 720p, 1080p, 4K) কনভার্ট করা হয়।
3. **Chunking (টুকরো করা):** পুরো ২ ঘন্টার মুভি একসাথে লোড করা বোকামি। আমরা প্রতিটা ভিডিওকে ছোট ছোট ৪-১০ সেকেন্ডের ফিজিক্যাল টুকরো বা **Chunks**-এ বিভক্ত করি।
4. **HLS & DASH (স্ট্রিমিং প্রোটোকল):** 
   - **HLS (HTTP Live Streaming - Apple)** বা **DASH (Dynamic Adaptive Streaming over HTTP)** প্রোটোকল ব্যবহার করা হয়।
   - একটি **Master Manifest file (`.m3u8` বা `.mpd`)** তৈরি করা হয় যা ট্র্যাক রাখে কোন রেজোলিউশনের কোন চঙ্ক ফাইলের পাথ কোথায়।

#### B. Dynamic Playback (Adaptive Bitrate Streaming)
- ক্লায়েন্ট ডিভাইস যখন ভিডিও রিকোয়েস্ট করে, সে প্রথমে `.m3u8` মাস্টার প্লেলিস্ট ফাইলটি লোড করে।
- ব্রাউজার ইউজারের ইন্টারনেটের স্পিড মেপে ডিসিশন নেয় সে কোন চঙ্ক ডাউনলোড করবে।
- স্পিড ভালো থাকলে সে অটোমেটিক `1080p_chunk_001.ts` ফেচ করে। মাঝপথে নেট ড্রপ করলে সে বাফারিং এড়াতে সাথে সাথে পরবর্তী চঙ্ক `360p_chunk_002.ts` রিকোয়েস্ট করে। একেই বলে **Adaptive Bitrate Streaming**।

### 🚀 Senior Scaling Hacks: Netflix Cache System
- **CDN Edge Placement:** নেটফ্লিক্স বা ইউটিউব ক্লাউড থেকে সরাসরি ইউজারকে ভিডিও দেয় না। তারা বিশ্বজুড়ে বিভিন্ন আইএসপি (ISP) অফিসের ভেতরে নিজেদের ক্যাশ স্টোরেজ বা হার্ডওয়্যার বক্স (যেমন **Netflix Open Connect Appliance**) ফ্রিতে বসিয়ে দেয়।
- এর ফলে, আপনার এলাকায় যখন কেউ কোনো পপুলার সিরিজ দেখে, তা সরাসরি আপনার লোকাল আইএসপির ভেতরে থাকা স্টোরেজ থেকে ক্যাশড হয়ে লোড হয়, যার ফলে কোনো ব্যাকবোন ইন্টারনেট ক্যাবল বা স্যাটেলাইট ব্যান্ডউইথ খরচ হয় না এবং বাফারিং লেটেন্সি হয় ০ মিলি-সেকেন্ড!

### 🛑 Staff Architect Edge Cases & Scaling Gaps

ভিডিও স্ট্রিমিং সার্ভিসের প্রোডাকশন এনভায়রনমেন্টে এই ৩টি আর্কিটেকচারাল চ্যালেঞ্জ আসবেই:

#### ১. The Thundering Herd Problem (Origin Shielding)
যখন পপুলার কোনো সিরিজের নতুন এপিসোড রিলিজ হয়, তখন লাখ লাখ ইউজার একসাথে একই ভিডিও প্লে করতে চায়। যেহেতু এটি নতুন ভিডিও, এটি সিডিএন (CDN) এজ পয়েন্টে ক্যাশড থাকবে না। ফলে প্রথম মিলি-সেকেন্ডেই সব রিকোয়েস্ট সিডিএনকে বাইপাস করে সরাসরি মেইন অরিজিন স্টোরেজে (AWS S3) হিট করবে। একে বলে **Thundering Herd** বা **CDN Cache Stampede**। এর ফলে S3-এর ব্যান্ডউইথ এক্সহস্ট হয়ে পুরো সাইট ডাউন হয়ে যাবে।
* **মিটিগেশন A (Origin Shield):** সিডিএন প্রোভাইডারে একটি "Origin Shield" (একটি সেন্ট্রাল প্যারেন্ট সিডিএন লেয়ার) কনফিগার করা। সব এজ পয়েন্ট সরাসরি S3-তে হিট না করে এই অরিজিন শিল্ডে হিট করবে। অরিজিন শিল্ড প্রথম রিকোয়েস্টটি নিয়ে S3 থেকে ফাইল এনে ক্যাশ করবে এবং বাকি লাখ লাখ রিকোয়েস্টকে তার নিজের মেমোরি থেকে রেসপন্স করবে।
* **মিটিগেশন B (Request Collapsing):** অ্যাপ্লিকেশন লেয়ারে মিউচুয়াল এক্সক্লুসিভ লক ব্যবহার করা, যাতে শুধুমাত্র একটি থ্রেড/সার্ভার অরিজিন থেকে ভিডিও চঙ্ক ফেচ করে ক্যাশ আপডেট করে, আর বাকি রিকোয়েস্টগুলো ফাস্ট থ্রেডের ক্যাশ আপডেটের জন্য ওয়েট করে।

#### ২. Playback Heartbeat & Dynamic Resuming State
ইউজার যখন নেটফ্লিক্সে একটি মুভি মাঝপথে বন্ধ করে আবার পরের দিন ওপেন করে, নেটফ্লিক্স ঠিক সেই সেকেন্ড থেকেই মুভিটি প্লে করে। মিলিয়ন মিলিয়ন ইউজারের এই রিয়েল-টাইম পজিশন কীভাবে ট্র্যাক করা হয়?
* **ডিজাইন:** ভিডিও প্লেয়ারে একটি **Heartbeat Event** লুপ থাকে যা প্রতি ১০ সেকেন্ড পর পর প্লেব্যাক অফসেট (যেমন `videoId: 101, offset: 4520 seconds`) ব্যাকএন্ডে পাঠায়। 
* **স্কেলিং:** প্রতি সেকেন্ডে কোটি কোটি হার্টবিট রিকোয়েস্ট সরাসরি মূল ডাটাবেসে (Postgres) রাইট করলে ডাটাবেস ১ সেকেন্ডেই ডাউন হবে। তাই এই হার্টবিট রিকোয়েস্টগুলোকে **Kafka**-তে পুশ করা হয়। কাফকা থেকে অ্যাসিনক্রোনাস কনজিউমার ডেটা নিয়ে অত্যন্ত ফাস্ট ইন-মেমোরি রাইট ডাটাবেসে (যেমন **Redis** বা **Cassandra**) স্টোর করে।

#### ৩. DRM (Digital Rights Management) & Anti-Piracy
নেটফ্লিক্সের কোনো ভিডিও আপনি ব্রাউজারের ডেভেলপার টুল দিয়ে ভিডিও ট্যাগ বা নেটওয়ার্ক ট্যাব থেকে ডাউনলোড করতে পারবেন না, করলেও তা চলবে না। এর কারণ হলো **DRM**।
* **ডিজাইন:** ভিডিওর প্রতিটি ৪ সেকেন্ডের চঙ্ক কনভার্ট করার সময়ই **AES-128** বা তার বেশি কি দিয়ে এনক্রিপ্ট করা হয়। প্লেয়ার যখন চঙ্ক লোড করে, সে দেখে এটি লক করা। তখন প্লেয়ার ব্যাকগ্রাউন্ডে একটি **DRM License Server**-এ সিকিউর টোকেন পাঠিয়ে ডিক্রিপশন কি রিকোয়েস্ট করে। প্লেয়ার ডিরেক্টলি রম বা হার্ডওয়্যার ডিক্রিপশন লেয়ারে (Google Widevine L1, Apple FairPlay, Microsoft PlayReady) কি-টি লোড করে রিয়েল-টাইমে চঙ্ক ডিক্রিপ্ট করে দেখায়। ভিডিও সোর্স ফাইল কখনো ইউজারের ডিভাইসের ডিস্কে আনলকড অবস্থায় সেভ হয় না।

---

## 📖 Chapter 03: High-Concurrency E-Commerce System

ই-কমার্স আর্কিটেকচারের সবচেয়ে কঠিন চ্যালেঞ্জ হলো **Flash Sales (ফ্ল্যাশ সেল)** হ্যান্ডেল করা। যখন ১০টি আইটেমের জন্য ১০ লাখ ইউজার একসাথে বাই বাটনে ক্লিক করে, তখন ডাটাবেসে কনকারেন্ট ট্রানজেকশন সামলানো এবং ডুপ্লিকেট পেমেন্ট ও ওভারসেলিং রোধ করাই আসল কাজ।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - প্রোডাক্ট ক্যাটালগ ও সার্চ।
  - শপিং কার্ট এবং চেকআউট সার্ভিস।
  - ফ্ল্যাশ সেল ও ডিসকাউন্ট হ্যান্ডলিং।
  - পেমেন্ট ও ইনভেন্টরি অটো-আপডেট।
- **Non-Functional:**
  - **Strict Consistency:** ১০টি প্রোডাক্টের জায়গায় কোনোভাবেই ১১টি অর্ডার নেওয়া যাবে না (No Overselling)।
  - **High Concurrency:** ফ্ল্যাশ সেলের সময় লাখ লাখ রিকোয়েস্ট হ্যান্ডেল করা।
  - **Payment Idempotency:** ইউজারের কার্ড থেকে যাতে ২ বার চার্জ না কাটা হয়।

### 🛠️ Flash Sale: Preventing Overselling
যদি আমরা সরাসরি ডাটাবেসে রিড-রাইট করে ইনভেন্টরি চেক করি:
```sql
-- Disaster Prone Transaction
SELECT quantity FROM inventory WHERE product_id = 99; -- Returns 1
-- App server logic: if quantity > 0, then:
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 99;
```
মাল্টিপল থ্রেড বা সার্ভার নোড একসাথে এটি রান করলে **Race Condition** হবে। একাধিক ইউজার একই ভ্যালু `1` রিড করবে এবং সবাই প্রোডাক্ট কিনে ফেলবে, যার ফলে ইনভেন্টরি মাইনাস হয়ে যাবে (Overselling)।

#### Solution A: Database Optimistic Locking (মাঝারি লোডের জন্য)
```sql
UPDATE inventory 
SET quantity = quantity - 1 
WHERE product_id = 99 AND quantity > 0;
```
এই কুয়েরিতে ডাটাবেস রো-লেভেল লক নিয়ে চেক করবে এবং একের বেশি ওভারসেল হতে দেবে না। তবে ডেটাবেস ডিস্ক কুয়েরি অনেক বেশি স্লো হওয়ায় হাই-কনকারেন্সিতে ডাটাবেস সম্পূর্ণ জ্যাম বা লকআপ হয়ে ক্র্যাশ করবে।

#### Solution B: In-Memory Redis Lua Distributed Lock (Staff Architect Standard)
ডিস্ক ডাটাবেসে হিট করার আগেই আমরা **Redis** ব্যবহার করে মেমোরিতে ইনভেন্টরি চেক ও ডিডাকশন করবো। যেহেতু Redis সিঙ্গেল-থ্রেডেড এবং অত্যন্ত ফাস্ট (>100K ops/sec), আমরা একটি **Atomic Lua Script** দিয়ে চেক ও ডিক্রিমেন্ট একসাথে হ্যান্ডেল করব:

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant GW as API Gateway / Server
    participant Cache as Redis (Atomic Cache)
    participant Queue as Kafka Message Queue
    participant DB as Postgres (Inventory Service)

    Client->>GW: Click "Buy Now" (Product 99)
    GW->>Cache: Run Lua Script: Check & Decrement Stock (product_id:99)
    alt Stock Available (Redis Stock > 0)
        Cache-->>GW: SUCCESS (Stock Reserved)
        GW->>Queue: Publish Event "Order_Placed"
        GW-->>Client: HTTP 202 Accepted (Order processing...)
        Queue->>DB: Async Consumer Updates PostgreSQL Inventory & Creates Order
    else Out of Stock
        Cache-->>GW: FAIL (Sold Out)
        GW-->>Client: HTTP 410 Gone (Sold Out!)
    end
```

### 💻 Production-Grade Redis Lua Script for Inventory Deduction
এই স্ক্রিপ্টটি Redis মেমোরিতে রান করে এবং রেস কন্ডিশন ছাড়া ১ মিলি-সেকেন্ডে ইনভেন্টরি বুক করে:

```typescript
import Redis from "ioredis";

const redis = new Redis();

/**
 * Atomic Lua script to safety deduct stock in Redis without race conditions
 */
const deductStockLua = `
  local stockKey = KEYS[1]
  local demand = tonumber(ARGV[1])
  
  local currentStock = tonumber(redis.call('get', stockKey))
  
  if not currentStock then
    return -1 -- Code indicating product key not found in Redis
  end
  
  if currentStock >= demand then
    redis.call('decrby', stockKey, demand)
    return currentStock - demand -- Return new remaining stock
  else
    return -2 -- Code indicating insufficient stock
  end
`;

export async function purchaseProduct(productId: string, quantity: number): Promise<boolean> {
  const stockKey = `stock:product:${productId}`;
  
  // Lua script রেজিস্টার ও রান করা (Atomic action)
  const result = await redis.eval(deductStockLua, 1, stockKey, quantity) as number;
  
  if (result >= 0) {
    console.log(`Stock successfully reserved! Remaining: ${result}`);
    // এখানে আমরা Kafka/RabbitMQ কিউতে মেসেজ পুশ করবো ডাটাবেসে অ্যাসিনক্রোনাস রাইটের জন্য
    return true;
  } else if (result === -1) {
    console.error("Error: Product is not loaded in Redis Cache!");
    return false;
  } else {
    console.warn("Out of Stock! Purchase failed.");
    return false;
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

ফ্ল্যাশ সেলের সময় ডুপ্লিকেট পেমেন্ট রোখা এবং মাল্টি-সার্ভিস ডেটা কনসিস্টেন্সি বজায় রাখার জন্য এই ৩টি প্যাটার্ন লাইফ-সেভার:

#### ১. Payment Idempotency (Double Charge Protection)
ফ্ল্যাশ সেলের সময় ইউজারের ইন্টারনেট স্লো থাকলে বা বাই বাটনে ২ বার ক্লিক করলে একই অর্ডারের জন্য ব্যাংক থেকে যাতে ২ বার টাকা কেটে না নেওয়া হয় তা এনশিওর করা অত্যন্ত জরুরি।
* **মিটিগেশন:** **Idempotency Keys**। যখনই ক্লায়েন্ট চেকআউট পেজ লোড করে, ব্যাকএন্ড একটি ইউনিক `idempotency_key` (UUID) জেনারেট করে ক্লায়েন্টকে দেয়। পেমেন্ট গেটওয়ে এপিআই রিকোয়েস্টে এই কি-টি হেডার হিসেবে পাঠানো হয়। পেমেন্ট সার্ভিস চার্জ কাটার আগে Redis-এ এই কি-টি চেক করে।
  * যদি কি-টি প্রথমবার আসে, পেমেন্ট গেটওয়ে চার্জ প্রসেস করে এবং রেজাল্ট Redis-এ সেভ করে (TTL: ২৪ ঘন্টা)।
  * যদি একই মিলি-সেকেন্ডে ২য় রিকোয়েস্ট আসে, Redis দেখে এটি অলরেডি প্রসেসিং-এ আছে, এবং সে ২য় পেমেন্ট এড়াতে সাথে সাথে আগের প্রসেসড রেজাল্ট বা "Processing..." এরর ফেরত দেয়।

#### ২. Distributed Transactions: The Saga Pattern
একটি সফল অর্ডারের পেছনে ৩টি মাইক্রোসার্ভিসের অ্যাকশন জড়িত: Inventory Service (স্টক রিজার্ভেশন), Payment Service (কার্ড চার্জ করা), এবং Order Service (অর্ডার বুক করা)। যেহেতু এরা আলাদা ডাটাবেস ব্যবহার করে, এদের মধ্যে কোনো `SQL BEGIN TRANSACTION` করা সম্ভব নয়।
* **সমাধান (Orchestrator-based Saga):** আমরা একটি **Saga Orchestrator** সার্ভিস ব্যবহার করি। 
  1. Orchestrator প্রথমে Inventory Service-কে বলে স্টক লক করতে। (সাকসেস)
  2. এরপর সে Payment Service-কে বলে কার্ড চার্জ করতে। (ধরা যাক পেমেন্ট ফেইল হলো)
  3. যেহেতু পেমেন্ট ফেইল হয়েছে, Orchestrator একটি **Compensating Transaction** রিলিজ করে। সে Inventory Service-কে ইনস্ট্রাকশন দেয় স্টক রিলিজ করে দিতে এবং Redis ক্যাশ রিব্যাক করতে। এর ফলে পুরো ডিস্ট্রিবিউটেড সিস্টেম কনসিস্টেন্ট থাকে।

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client
    participant Orc as Saga Orchestrator
    participant Inv as Inventory Service
    participant Pay as Payment Service
    participant Ord as Order Service

    Client->>Orc: Start Checkout
    Orc->>Inv: 1. Reserve Stock (Success)
    Orc->>Pay: 2. Charge Card (FAILED!)
    Note over Orc,Pay: Payment Failed! Trigger Rollback
    Orc->>Inv: 3. Compensating Transaction: Release Stock
    Orc-->>Client: Checkout Failed (Refund/Stock Released)
```

#### ৩. Transactional Outbox Pattern & CDC (Redis to DB Sync)
ফ্ল্যাশ সেলের সময় Redis-এ স্টক ডিডাক্ট হওয়ার পর ডাটাবেসে অ্যাসিনক্রোনাসলি ডেটা সিঙ্ক করার জন্য আমরা যদি র্যান্ডম মেসেজ কিউ ব্যবহার করি, তবে অর্ডার সাকসেসফুল কিন্তু ডাটাবেস ডাউন থাকলে মেসেজ হারিয়ে যেতে পারে।
* **সমাধান:** **Transactional Outbox Pattern**। যখন Order Service ডাটাবেসে অর্ডার ক্রিয়েট করে, সে একই ডাটাবেস ট্রানজেকশনে আরেকটি `outbox` টেবিলে একটি ইভেন্ট মেসেজ লিখে (`INSERT INTO outbox`). যেহেতু একই রিলেশনাল ডিবি-র একক ট্রানজেকশনে লেখা হচ্ছে, তাই অর্ডার ক্রিয়েশন এবং আউটবক্সে মেসেজ রাইট ১০০% গ্যারান্টিড। 
* এর পর একটি ব্যাকগ্রাউন্ড **CDC Daemon (Debezium + Kafka)** ডাটাবেসের ট্রানজেকশন লোগ (WAL - Write-Ahead Log) রিড করে ওই আউটবক্স মেসেজটি কাফকাতে পুশ করে, যা ইনভেন্টরি ডাটাবেস ও ক্যাশ সিঙ্ক করতে কনজিউম করা হয়। এতে ডাটাবেস ক্র্যাশ করলেও মেসেজ কখনোই হারায় না।

---

## 📖 Chapter 04: WhatsApp & Messenger (Real-Time Chat Engine)

রিয়েল-টাইম চ্যাট সিস্টেমের আর্কিটেকচার সাধারণ HTTP অ্যাপের চেয়ে একেবারেই আলাদা। এখানে প্রতি সেকেন্ডে লাখ লাখ ইউজারের রিয়েল-টাইম কানেকশন ধরে রাখতে হয় এবং মিলি-সেকেন্ড লেটেন্সিতে মেসেজ ডেলিভারি এনশিওর করতে হয়।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ওয়ান-টু-ওয়ান মেসেজিং অত্যন্ত কম লেটেন্সিতে (< ১০০ মিলি-সেকেন্ড)।
  - অনলাইন/অফলাইন স্ট্যাটাস ট্র্যাক করা (Presence Service)।
  - মেসেজের ৩টি ক্লাসিক ডেলিভারি স্ট্যাটাস: Sent, Delivered, Read (Ticks)।
  - পারসিস্টেন্ট চ্যাট হিস্ট্রি (অফলাইনেও আগের চ্যাট স্ক্রোল করা যাবে)।
- **Non-Functional:**
  - **Strict Reliability:** কোনো মেসেজ ডিলিট বা লস হওয়া যাবে না।
  - **High Availability:** রিড-রাইট ফ্লো সব সময় আপটাইম থাকতে হবে।
  - **Massive Scale:** ১০০ মিলিয়ন ডেইলি একটিভ ইউজার (DAU) এবং প্রতিদিন ১০ বিলিয়ন মেসেজ হ্যান্ডেল করা।

### ২. Back-of-the-envelope Estimation
* `Message QPS = 10,000,000,000 / 86,400 seconds ≈` **115,000 messages/sec average QPS**
* `Peak QPS = 115,000 * 3 ≈` **345,000 messages/sec**
* `Concurrent Active WebSocket Connections = 100M DAU * 10% peak online ≈` **10 Million concurrent active sockets**
* `Storage for 10 Years (avg message 100 bytes) = 10B * 100 bytes = 1 TB/day`
  * `10-Year Total Storage = 1 TB * 365 days * 10 years ≈` **3.65 Petabytes**
  * যেহেতু ডেটা হেভি রাইট-ইনটেনসিভ এবং ডিরেক্ট `userId` বা `chatId` কুয়েরি করা হবে, নোএসকিউএল ওয়াইড-কলাম ডাটাবেস (যেমন **Cassandra** বা **ScyllaDB**) এখানে পারফেক্ট।

### ৩. API & Database Schema Design
রিয়েল-টাইম মেসেজিংয়ে পোলিং বাদ দিয়ে আমরা **WebSocket** প্রোটোকল ব্যবহার করব, যা ক্লায়েন্ট এবং সার্ভারের মধ্যে একটি দ্বিমুখী (Bidirectional), লং-লিভড টিসিপি কানেকশন বজায় রাখে। 
হিস্ট্রি কোয়েরির জন্য একটি ব্যাকআপ REST API থাকবে:
- `GET /api/v1/messages?chat_id={chat_id}&limit=50` (প্যাজিনেটেড চ্যাট হিস্ট্রি)

#### Database Schema (Cassandra Wide-Column Model)
Cassandra-র স্টোরেজ আর্কিটেকচার ডেটাকে মেমোরিতে (MemTable) রাইট করে সরাসরি ক্রনোলজিক্যালি ডিস্কে (SSTable) সেভ করে, যার ফলে ডিস্কের কোনো র্যান্ডম সিক ছাড়াই এটি বিলিয়ন বিলিয়ন রো লিখতে পারে।

```sql
CREATE TABLE chat_messages (
    chat_id uuid,
    message_id timeuuid, -- Embeds timestamp, Chronological order guarantees
    sender_id uuid,
    content text,
    status varchar, -- 'sent', 'delivered', 'read'
    PRIMARY KEY (chat_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```
*(নোট: এখানে `chat_id` হলো **Partition Key**, যা একটি চ্যাটের সব মেসেজকে ফিজিক্যালি একই হার্ডওয়্যার নোডে স্টোর করে। আর `message_id` হলো **Clustering Key**, যা মেসেজগুলোকে সময় অনুযায়ী ডিসেন্ডিং অর্ডারে সর্ট করে রাখে। ফলে চ্যাট লোড করা অত্যন্ত ফাস্ট হয়)।*

### ৪. High-Level Architecture
সিস্টেমের রিয়েল-টাইম মেসেজ রাউটিং ফ্লো নিচে চিত্রায়িত করা হলো:

```mermaid
flowchart TD
    BrowserClientA["Client A (Online)"] -->|1. WebSocket Conn| WSGatewayA["WebSocket Server A"]
    BrowserClientB["Client B (Online)"] -->|WebSocket Conn| WSGatewayB["WebSocket Server B"]
    
    WSGatewayA -->|2. Check Route| PresenceRedis["Presence Service (Redis)"]
    WSGatewayA -->|3. Publish Message| MsgBroker["Message Broker (Kafka / RabbitMQ)"]
    
    MsgBroker -->|4. Save Async| ChatService["Chat Service (Cassandra DB)"]
    MsgBroker -->|5. Forward Event| WSGatewayB
    WSGatewayB -->|6. Instant Delivery| BrowserClientB
    
    style BrowserClientA fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style WSGatewayA fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style MsgBroker fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style ChatService fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Connection Registry Implementation
যেহেতু আমাদের ১০ মিলিয়ন কনকারেন্ট সকেট থাকবে, এগুলোকে কোনো একটি সিঙ্গেল সার্ভারে রাখা সম্ভব নয়। আমাদের ১০০+ গেটওয়ে সার্ভার লাগবে। ইউজার A যখন ইউজার B-কে মেসেজ পাঠাবে, তখন গেটওয়ে A-কে জানতে হবে ইউজার B কোন গেটওয়ে সার্ভারে কানেক্টেড আছে, যাতে মেসেজটি সঠিক নোডে পুশ করা যায়।

নিচে Redis-ভিত্তিক একটি প্রোডাকশন-গ্রেড ডিস্ট্রিবিউটেড **Connection Routing & Presence Registry** কোড দেওয়া হলো:

```typescript
import Redis from "ioredis";

const redis = new Redis();

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

export class MessageGatewayRegistry {
  private static readonly PRESENCE_PREFIX = "presence:user:";
  private static readonly ROUTING_PREFIX = "routing:user:";
  
  private currentServerId: string;

  constructor(serverId: string) {
    this.currentServerId = serverId;
  }

  /**
   * ইউজার গেটওয়েতে কানেক্ট হলে তার অনলাইন স্ট্যাটাস এবং রাউটিং টার্গেট সেট করে
   */
  public async registerUserConnection(userId: string): Promise<void> {
    const multi = redis.multi();
    // Presence set to online with 5 mins TTL (Heartbeat keeps this alive)
    multi.set(`${MessageGatewayRegistry.PRESENCE_PREFIX}${userId}`, "online", "EX", 300);
    // Map user socket to this specific WebSocket gateway server
    multi.set(`${MessageGatewayRegistry.ROUTING_PREFIX}${userId}`, this.currentServerId);
    await multi.exec();
    console.log(`User ${userId} successfully registered on Gateway ${this.currentServerId}`);
  }

  /**
   * ইউজার ডিসকানেক্ট হলে স্ট্যাটাস ডিলিট করে
   */
  public async deregisterUserConnection(userId: string): Promise<void> {
    const multi = redis.multi();
    multi.del(`${MessageGatewayRegistry.PRESENCE_PREFIX}${userId}`);
    multi.del(`${MessageGatewayRegistry.ROUTING_PREFIX}${userId}`);
    await multi.exec();
  }

  /**
   * টার্গেট ইউজার কোন গেটওয়েতে কানেক্টেড আছে তা ট্র্যাক করে
   */
  public async getRouteForUser(userId: string): Promise<string | null> {
    return await redis.get(`${MessageGatewayRegistry.ROUTING_PREFIX}${userId}`);
  }

  /**
   * Redis Pub/Sub এর মাধ্যমে রিয়েল-টাইম মেসেজ সঠিক গেটওয়েতে রিলে করে দেয়
   */
  public async relayMessage(message: ChatMessage): Promise<boolean> {
    const targetServerId = await this.getRouteForUser(message.receiverId);
    
    if (!targetServerId) {
      console.log(`Receiver ${message.receiverId} is offline. Pushing to offline queue.`);
      await this.queueOfflineMessage(message);
      return false;
    }

    // Publish to the specific channel of the target WebSocket Server
    const channelName = `gateway:channel:${targetServerId}`;
    await redis.publish(channelName, JSON.stringify(message));
    console.log(`Message successfully published to ${channelName} for user ${message.receiverId}`);
    return true;
  }

  private async queueOfflineMessage(message: ChatMessage): Promise<void> {
    // অফলাইনে থাকা অবস্থায় মেসেজটি কিউতে অ্যাড করে মোবাইল পুশ নোটিফিকেশন ট্রিগার করা হবে
    await redis.lpush(`offline:queue:user:${message.receiverId}`, JSON.stringify(message));
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

রিয়েল-টাইম চ্যাট স্কেলিংয়ের ক্ষেত্রে প্রোডাকশনে ফেস করা ৩টি অত্যন্ত জঘন্য সমস্যা ও তাদের সিনিয়র লেভেল সমাধান:

#### ১. Operating System Socket Limits & VIP Load Balancing
১০ মিলিয়ন কনকারেন্ট কানেকশনের অর্থ হলো গেটওয়ে সার্ভারগুলোর ওপর ১০ মিলিয়ন লং-লিভড টিসিপি কানেকশন খোলা রাখা। লিনাক্স অপারেটিং সিস্টেমে প্রতি ফিজিক্যাল নোডে বাই-ডিফল্ট ৬৫,৫৩৫ টির বেশি আউটবাউন্ড সকেট কানেকশন হ্যান্ডেল করা যায় না।
* **মিটিগেশন A (Linux OS Kernel Tuning):** লিনাক্স কার্নেল কনফিগারেশনে ফাইল ডেসক্রিপ্টরের লিমিট বাড়াতে হবে। `sysctl` ফাইলে `fs.file-max` লিমিট এবং `nofile` সফট/হার্ড লিমিট ১০ লাখের ওপরে সেট করতে হবে।
* **মিটিগেশন B (Virtual IPs - VIPs):** লোড ব্যালেন্সারে মাল্টিপল ফিজিক্যাল আইপি অ্যাসাইন করা। ক্লায়েন্টদের কানেক্ট করার জন্য আমরা **Consistent Hashing** ব্যবহার করে লোড সমানভাবে ডিস্ট্রিবিউট করব যাতে কোনো নির্দিষ্ট গেটওয়েতে সকেট ক্র্যাশ না হয়।

#### ২. Delivery receipts Storm under High Concurrency
প্রতিটি মেসেজ ডেলিভারির জন্য ৩টি করে টিক (Sent, Delivered, Read) জেনারেট হয়। অর্থাৎ প্রতিদিন ১০ বিলিয়ন মেসেজ পাঠানো হলে সিস্টেমে মোট ৩০ বিলিয়ন এক্সট্রা স্ট্যাটাস আপডেট রাইট ইভেন্ট আসে। এটি সরাসরি ডাটাবেসে বা গেটওয়েতে ট্রানজেক্ট করা হলে পুরো নেটওয়ার্ক থ্রোটল হয়ে যাবে।
* **মিটিগেশন:** **Delivery Receipt Batching & Coalescing**। ক্লায়েন্ট ডিভাইস যখন চ্যাট স্ক্রিন স্ক্রোল করে, সে প্রতি মেসেজে আলাদা রিকোয়েস্ট না পাঠিয়ে ১ সেকেন্ডের বাফারে রিসিপ্ট ডেটা জমা করে (যেমন: "Message 1 to 50 are Read")। তারপর সিঙ্গেল রিকোয়েস্ট পাঠিয়ে ডাটাবেসে বাল্ক আপডেট করে। এতে ডাটাবেসের রাইট অপারেশন ৩০ বিলিয়ন থেকে কমে মাত্র ৩০০ মিলিয়নে নেমে আসে!

#### ৩. Hotspots in Cassandra Partitioning (Massive Group Chats)
যদি ১০,০০০ মেম্বার বিশিষ্ট কোনো পপুলার গ্রুপ চ্যাটে মেসেজ আদান-প্রদান হতে থাকে, তবে `chat_id` পার্টিকুলারলি একটি ডাটাবেস পার্টিকপ্ট নোডের ওপর চরম চাপ তৈরি করবে। Cassandra-র একটি ফিজিক্যাল পার্টিকপ্ট সাধারণত ১০০MB-এর বেশি হলে পারফরম্যান্স কড়া শুরু করে।
* **মিটিগেশন (Partition Key Salting):** আমরা `chat_id` এর সাথে একটি বাকেট ভ্যালু যুক্ত করব (যেমন `chat_id + bucket_id`), যেখানে `bucket_id` হবে `timestamp / 1-hour` অথবা একটি সাইক্লিক কাউন্টার `(1 to 10)`। এর ফলে একই গ্রুপের মেসেজগুলো ডাটাবেসের আলাদা আলাদা ফিজিক্যাল ডিস্ক ব্লকে ডিস্ট্রিবিউট হয়ে যাবে এবং ডাটাবেস বটলনেক সম্পূর্ণ ভ্যানিশ হয়ে যাবে।

---

## 📖 Chapter 05: Uber & Grab (Ride-Sharing Geospatial Engine)

রাইড-শেয়ারিং সিস্টেমের মূল কারিগরি চ্যালেঞ্জ হলো প্রতি সেকেন্ডে লাখ লাখ ড্রাইভারের দ্রুত পরিবর্তনশীল ভৌগলিক অবস্থান (Geolocation) রিয়েল-টাইমে ট্র্যাক করা এবং কোনো রাইডার রিকোয়েস্ট পাঠালে ১ কিলোমিটারের মধ্যে থাকা পারফেক্ট ড্রাইভারটিকে ৫০ মিলি-সেকেন্ডের মধ্যে খুঁজে বের করা।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ড্রাইভাররা প্রতি ৪ সেকেন্ড পর পর তাদের রিয়েল-টাইম জিপিএস স্থানাঙ্ক (Latitude, Longitude) ব্যাকএন্ডে পাঠাবে।
  - রাইডাররা তাদের চারপাশের ৩ কিলোমিটার ব্যাসার্ধের মধ্যে থাকা সব এভেইলেবল ড্রাইভার রিয়েল-টাইমে ম্যাপে দেখতে পাবে।
  - রাইডার রাইড রিকোয়েস্ট করলে সিস্টেম সবচেয়ে কাছের ড্রাইভারকে তার সাথে ট্রিপ ম্যাচ করিয়ে দেবে।
- **Non-Functional:**
  - **Ultra-low Latency:** ড্রাইভার ম্যাচিং এবং সার্চ কুয়েরি অত্যন্ত ফাস্ট হতে হবে (< ৫০ মিলি-সেকেন্ড)।
  - **High Scalability:** ১ মিলিয়ন একটিভ ড্রাইভারের সেকেন্ডে লাখ লাখ জিপিএস আপডেট এবং ১০ মিলিয়ন একটিভ রাইডারের কনকারেন্ট কুয়েরি হ্যান্ডেল করা।
  - **Strict Consistency (Match Lock):** একই ড্রাইভার যাতে একসাথে ২ জন রাইডারের সাথে ম্যাচ না হয়ে যায় (No Double-Booking)।

### ২. Back-of-the-envelope Estimation
* `Driver Location Write QPS = 1,000,000 active drivers / 4 seconds =` **250,000 writes/sec**
* `Rider Search Query QPS = 10,000,000 riders / 8 seconds map updates =` **1,250,000 reads/sec**
* `Location Update Size = driver_id (16 bytes) + latitude (8 bytes) + longitude (8 bytes) = 32 bytes`
* `Network Write Bandwidth = 250,000 * 32 bytes ≈` **8 MB/sec**
* **Memory Requirement (Redis Cache):** 
  * মেমরিতে ১ মিলিয়ন ড্রাইভারের জিপিএস ডেটা স্টোর করতে সাইজ হবে: `1,000,000 * 100 bytes (Redis overhead সহ) ≈` **100 MB RAM**। এটি অত্যন্ত ছোট, তাই সম্পূর্ণ লাইভ ডেটা রেডিসে সুপার-ফাস্ট স্টোর করা সম্ভব।

### ৩. API & Database Schema Design
যেহেতু জিপিএস রাইট অপারেশন প্রতি সেকেন্ডে ২৫০K বার ঘটে, প্রথাগত HTTP ওভারহেড এড়াতে ড্রাইভার ডিভাইসগুলো **WebSocket** অথবা লাইটওয়েট **UDP/TCP Stream** ব্যবহার করবে। 
রাইডারদের জন্য এপিআই থাকবে:
- `GET /api/v1/nearby?lat=23.7561&lng=90.3762&radius=3000` (৩ কিমি ব্যাসার্ধের ড্রাইভার সার্চ)

#### Database Selection: SQL vs NoSQL Spatial Indexes
ডিস্ক-ভিত্তিক ডাটাবেস (যেমন PostgreSQL PostGIS) ২৫০K QPS রাইট সামলাতে সম্পূর্ণ ক্র্যাশ করবে। তাই লাইভ ট্র্যাকিংয়ের জন্য আমরা **In-memory Redis Geospatial Index (GEOADD, GEORADIUS)** ব্যবহার করব।
কমপ্লিটেড ট্রিপ ডেটা এবং বিলিং হিস্ট্রি ব্যাকআপের জন্য রিলেশনাল ডাটাবেস (PostgreSQL) ব্যবহার করা হবে।

### ৪. High-Level Architecture
ভৌগলিক ট্রাফিক ফ্লো নিচে চিত্রায়িত করা হলো:

```mermaid
flowchart TD
    DriverApp["Driver Device"] -->|1. Location Stream 4s| IngestGW["Geo-Ingest Gateway"]
    IngestGW -->|2. Fast Write| RedisGeo["Redis Geo Cluster Live RAM Storage"]
    
    RiderApp["Rider Device"] -->|3. Get Nearby Drivers| RiderAPI["Rider API Gateway"]
    RiderAPI -->|4. GEORADIUS Search| RedisGeo
    
    RiderAPI -->|5. Match Ride| MatchService["Ride Match Engine"]
    MatchService -->|6. Acquire Lock| RedisLock["Redis Distributed Lock Redlock"]
    MatchService -->|7. Send Push Notification| NotifyService["Push Notification Service"]
    NotifyService -->|8. Request Ride| DriverApp
    
    style DriverApp fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style RedisGeo fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style MatchService fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Geospatial Engine Implementation
নিচে `ioredis` ব্যবহার করে ড্রাইভারদের লোকেশন আপডেট এবং ৩ কিমি ব্যাসার্ধের এভেইলেবল ড্রাইভার খুঁজে বের করার জন্য একটি প্রোডাকশন-রেডি **Geospatial Tracking Engine** কোড দেওয়া হলো:

```typescript
import Redis from "ioredis";

const redis = new Redis();

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface NearbyDriver {
  driverId: string;
  latitude: number;
  longitude: number;
  distanceInMeters: number;
}

export class GeoLocationEngine {
  private static readonly GEO_KEY = "active:drivers:location";

  /**
   * ড্রাইভারের লাইভ লোকেশন রেডিস জিও-ইনডেক্সে আপডেট করে
   * Redis internally encodes (latitude, longitude) into a 52-bit Geohash integer
   */
  public async updateDriverLocation(driverId: string, lat: number, lng: number): Promise<void> {
    // GEOADD takes key, longitude, latitude, memberId
    await redis.geoadd(GeoLocationEngine.GEO_KEY, lng, lat, driverId);
  }

  /**
   * ড্রাইভার অফলাইনে গেলে ইনডেক্স থেকে মুছে ফেলে
   */
  public async removeOfflineDriver(driverId: string): Promise<void> {
    await redis.zrem(GeoLocationEngine.GEO_KEY, driverId);
  }

  /**
   * রাইডারের ৩ কিলোমিটারের ভেতরে থাকা এভেইলেবল ড্রাইভারদের দূরত্বসহ সর্ট করে নিয়ে আসে
   */
  public async findNearbyDrivers(
    riderLat: number,
    riderLng: number,
    radiusInMeters: number,
    limit = 10
  ): Promise<NearbyDriver[]> {
    // GEORADIUS fetches members with distance and raw coordinates sorted ascendingly
    const results = await redis.georadius(
      GeoLocationEngine.GEO_KEY,
      riderLng,
      riderLat,
      radiusInMeters,
      "m", // meters
      "WITHDIST",
      "WITHCOORD",
      "ASC", // closest first
      "COUNT", limit
    ) as any[];

    return results.map((item) => {
      const [driverId, distance, [lngStr, latStr]] = item;
      return {
        driverId,
        distanceInMeters: parseFloat(distance),
        latitude: parseFloat(latStr),
        longitude: parseFloat(lngStr),
      };
    });
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

বাস্তব জীবনের মিলিয়ন-ইউজার স্কেলে রাইড ম্যাচিং ইঞ্জিনে এই ৩টি ক্রিটিক্যাল আর্কিটেকচারাল প্রবলেম আসে:

#### ১. The Grid Boundary Problem (Geohash vs Hexagonal H3 Grid)
**Geohash** পৃথিবীকে আয়তাকার (Rectangle) গ্রিডে ভাগ করে। যদি কোনো রাইডার ঠিক গ্রিডের সীমানায় (Edge/Boundary) দাঁড়িয়ে থাকে এবং কোনো ড্রাইভার তার থেকে মাত্র ৫ মিটার দূরে অন্য পাশের গ্রিডে থাকে, Geohash কুয়েরি তাকে মিস করে যাবে।
* **মিটিগেশন (H3 Hexagonal Grid):** উবার এই সমস্যাটি দূর করতে **H3 Spatial Indexing (Hexagonal Hierarchical Spatial Index)** তৈরি করে। হেক্সাগন বা ষড়ভুজের ক্ষেত্রে কেন্দ্র থেকে তার প্রতিটি প্রতিবেশী কোণের দূরত্ব একদম সমান। এর ফলে বাউন্ডারি প্রবলেম সম্পূর্ণ দূর হয় এবং নিখুঁতভাবে চারপাশের ড্রাইভারদের ডিটেক্ট করা যায়।

#### ২. Write Saturation of Redis (Hotspots on Single CPU Core)
যেহেতু Redis সিঙ্গেল-থ্রেডেড, সেকেন্ডে ২৫০,০০০ রাইট রিকোয়েস্ট যদি একটি মাত্র Redis Key (`active:drivers:location`) এর ওপরে যায়, তবে প্রসেসরের একটিコア ১০০% বিজি হয়ে ক্র্যাশ করবে।
* **মিটিগেশন (Geographical Sharding):** ড্রাইভারদের লোকেশন সারা বিশ্বের একটি কিতে সেভ না করে আমরা Geohash এর প্রথম ৪ ক্যারেক্টার দিয়ে কি শার্ডিং করব। যেমন, ঢাকার সব ড্রাইভারের ডেটা যাবে `location:shard:dhaka` আর চট্রগ্রামের ডেটা যাবে `location:shard:ctg` শ্যার্ডে। এতে লোড মাল্টিপল নোডে ডিস্ট্রিবিউট হয়ে যাবে এবং Redis ক্লাস্টার সেকেন্ডে মিলিয়ন রাইট অনায়াসে সামলাতে পারবে।

#### ৩. The Double-Booking Race Condition (Ride Matching Lock)
একই এলাকায় দুজন রাইডার একই মিলি-সেকেন্ডে "Request Ride" বাটনে ক্লিক করলে সিস্টেম যদি তাদের দুজনকে একই ফ্রি ড্রাইভারের কাছে পাঠায়, তবে ড্রাইভার কনফিউজড হবে এবং সিস্টেমে কনফ্লিক্ট দেখা দেবে।
* **মিটিগেশন:** **Atomic Distributed Lock (Redlock)**। রাইড ম্যাচিং ইঞ্জিন যখনই কোনো ড্রাইভারকে কোনো রাইডারের সাথে এসোসিয়েট করার প্রসেস শুরু করবে, সে সাথে সাথে Redis-এ ওই ড্রাইভারের আইডির বিপরীতে একটি ক্ষণস্থায়ী ডিস্ট্রিবিউটেড লক নেবে:
  `redis.set("driver:lock:" + driverId, "LOCKED", "NX", "EX", 10)`
  লকটি সফল হলেই কেবল ড্রাইভারকে অফার পাঠানো হবে। লক ফেইল হলে ম্যাচ মেকার অন্য আরেকটি কাছাকাছি ড্রাইভারকে সাথে সাথেই সিলেক্ট করে নেবে।

---

## 📖 Chapter 06: Twitter/X (News Feed & Timeline Fanout Engine)

সোশ্যাল মিডিয়া ফিড জেনারেট করার মূল কারিগরি চ্যালেঞ্জ হলো চরম রিড-রাইট অসমতা এবং ফ্যানআউট (Fanout)। যখন লাখ লাখ ইউজার প্রতি সেকেন্ডে টুইট করছেন এবং কোটি কোটি ইউজার তাদের হোম টাইমলাইন রিফ্রেশ করছেন, তখন লেটেন্সি ১০০ মিলি-সেকেন্ডের নিচে রাখাই আসল ইঞ্জিনিয়ারিং।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ইউজার টুইট পোস্ট করতে পারবেন (টেক্সট এবং মিডিয়া)।
  - ইউজার অন্য ইউজারদের ফলো করতে পারবেন।
  - ইউজার তার হোম টাইমলাইন (News Feed) দেখতে পাবেন, যেখানে তার ফলো করা সব মানুষের লেটেস্ট টুইটগুলো ক্রনোলজিক্যালি সাজানো থাকবে।
  - ইউজার তার নিজস্ব ইউজার টাইমলাইন (টুইট হিস্ট্রি) দেখতে পাবেন।
- **Non-Functional:**
  - **Ultra-fast Feed Generation:** হোম ফিড রিকোয়েস্ট করতে ১০০ মিলি-সেকেন্ডের কম সময় লাগতে হবে।
  - **High Scalability:** ৩০০ মিলিয়ন একটিভ ইউজার এবং প্রতিদিন ৫০০ মিলিয়ন টুইট পোস্ট সামলানো।
  - **Celebrity Handle (High Fanout):** কোনো সেলিব্রিটি টুইট করলে তা যাতে মুহূর্তের মধ্যে কোটি কোটি ফলোয়ারের ওয়ালে পৌঁছায় আবার সিস্টেমও ক্র্যাশ না করে।

### ২. Back-of-the-envelope Estimation
* `Tweet Write QPS = 500,000,000 tweets / 86,400 seconds ≈` **5,800 writes/sec average QPS**
* `Peak Write QPS ≈` **12,000 writes/sec**
* `Feed Read QPS = 100M DAU * 10 views/day = 1B views / 86400 ≈` **11,500 reads/sec average QPS**
* `Peak Read QPS ≈` **35,000 reads/sec**
* **Fanout Multiplying Effect:**
  * প্রতিটি ইউজারের এভারেজ ফলোয়ার সংখ্যা ১০০ হলে: `5,800 writes/sec * 100 followers =` **580,000 writes/sec** ডিস্ট্রিবিউটেড ফিড ক্যাশে রাইট করতে হবে।
  * কিন্তু কোনো সেলিব্রিটির (যেমন ক্রিস্টিয়ানো রোনালদো, ১০০M ফলোয়ার) ১টি টুইট ফ্যানআউট করতে গেলে এক মিলি-সেকেন্ডে **১০০,০০০,০০০ টি ক্যাশ রাইট** ট্রাই করবে, যা পুরো সিস্টেম ক্র্যাশ করে দেবে! একেই বলে **Celebrity Write Explosion**।

### ৩. API & Database Schema Design
ফিড ও টুইট প্রসেসিংয়ের জন্য স্ট্যান্ডার্ড এপিআই ডিজাইন:
- `POST /api/v1/tweet` (টুইট তৈরি)
- `GET /api/v1/feed?limit=20` (হোম ফিড ফেচ)

#### Database Tables Structure
টুইট ডেটা এবং রিলেশনশিপ ম্যাপ করার জন্য রিলেশনাল বা হাই-পারফরম্যান্স নোএসকিউএল ডিবি:

```sql
CREATE TABLE tweets (
    tweet_id bigint PRIMARY KEY,
    user_id bigint,
    content varchar(280),
    created_at timestamp
);

CREATE TABLE follows (
    follower_id bigint,
    followee_id bigint,
    created_at timestamp,
    PRIMARY KEY (follower_id, followee_id)
);
```

### ৪. High-Level Architecture
টুইটার ফিড জেনারেশনে আমরা **Hybrid Push/Pull Architecture** ব্যবহার করব। নিচে ট্রাফিক ফ্লো দেওয়া হলো:

```mermaid
flowchart TD
    UserApp["User Client App"] -->|1. Post Tweet| Gateway["API Gateway and Tweet Service"]
    Gateway -->|2. Save Raw Tweet| TweetDB["Tweets Storage Postgres Cassandra"]
    Gateway -->|3. Trigger Fanout| FanoutQueue["Fanout Message Queue Kafka"]
    
    FanoutQueue -->|4. Push to Normal Followers| NormalFeedCache["Redis Sorted Set Home Feed Cache"]
    
    Gateway -->|5. Read Home Feed| FeedService["Feed Retrieval Service"]
    FeedService -->|6. Fetch Pre-computed Feed| NormalFeedCache
    FeedService -->|7. Dynamically Pull Hybrid| CelebCache["Redis Cache Celebrity Tweets"]
    
    FeedService -->|8. Sorted and Combined Feed| UserApp
    
    style UserApp fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style NormalFeedCache fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style CelebCache fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style FanoutQueue fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Hybrid Fanout Engine Implementation
নিচে একটি প্রোডাকশন-রেডি **Hybrid Fanout Engine** কোড দেওয়া হলো যা সেলিব্রিটি এবং সাধারণ ইউজারদের টুইট সম্পূর্ণ আলাদা পাইপলাইনে প্রসেস ও মার্জ করে:

```typescript
import Redis from "ioredis";

const redis = new Redis();

interface Tweet {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
}

export class NewsFeedFanoutEngine {
  private static readonly TIMELINE_PREFIX = "timeline:user:";
  private static readonly CELEB_POSTS_PREFIX = "celeb:tweets:";
  private static readonly CELEBRITY_THRESHOLD = 10000; // ১০,০০০ ফলোয়ারের বেশি হলে সেলিব্রিটি

  /**
   * ডেমো ফলোয়ার ডাটা ফেচিং (প্রোডাকশনে ডাটাবেস থেকে আসবে)
   */
  private async getFollowers(userId: string): Promise<{ followerIds: string[]; count: number }> {
    return {
      followerIds: ["follower_1", "follower_2", "follower_3"],
      count: 3
    };
  }

  /**
   * নতুন টুইট পোস্ট হওয়ার পর ফ্যানআউট ডিসিশন নেয়
   */
  public async processNewTweet(tweet: Tweet): Promise<void> {
    const { followerIds, count } = await this.getFollowers(tweet.userId);

    if (count > NewsFeedFanoutEngine.CELEBRITY_THRESHOLD) {
      // 🟢 অপশন A: Fanout-on-read (Pull Model for Celebrities)
      // সেলিব্রিটির টুইটগুলো তার নিজস্ব ডেডিকেটেড ক্যাশে সেভ থাকবে, কোটি কোটি ওয়ালে পুশ হবে না
      const celebKey = `${NewsFeedFanoutEngine.CELEB_POSTS_PREFIX}${tweet.userId}`;
      await redis.zadd(celebKey, tweet.createdAt, JSON.stringify(tweet));
      await redis.zremrangebyrank(celebKey, 0, -100); // শুধুমাত্র লেটেস্ট ১০০টি টুইট রাখবো
      console.log(`Celebrity tweet saved to pull cache for user ${tweet.userId}`);
    } else {
      // 🟢 অপশন B: Fanout-on-write (Push Model for Normal Users)
      // নরমাল ইউজারের টুইট সাথে সাথে সব ফলোয়ারের ইন-মেমোরি টাইমলাইনে পুশ করা হবে
      const pipeline = redis.pipeline();
      for (const followerId of followerIds) {
        const timelineKey = `${NewsFeedFanoutEngine.TIMELINE_PREFIX}${followerId}`;
        pipeline.zadd(timelineKey, tweet.createdAt, JSON.stringify(tweet));
        pipeline.zremrangebyrank(timelineKey, 0, -500); // হোম ফিডে ম্যাক্স ৫০০টি টুইট ক্যাশ থাকবে
      }
      await pipeline.exec();
      console.log(`Pushed tweet from ${tweet.userId} to ${followerIds.length} followers.`);
    }
  }

  /**
   * ইউজারের জন্য হোম টাইমলাইন বা ফিড জেনারেট করে (Hybrid Merge)
   */
  public async getHomeTimeline(userId: string, followedCelebrities: string[], limit = 20): Promise<Tweet[]> {
    const timelineKey = `${NewsFeedFanoutEngine.TIMELINE_PREFIX}${userId}`;
    
    // ১. প্রি-কম্পিউটেড নরমাল ফলোয়ারদের টুইট ক্যাশ থেকে ফেচ করি
    const normalTweetsRaw = await redis.zrevrange(timelineKey, 0, limit - 1);
    const tweets: Tweet[] = normalTweetsRaw.map((t) => JSON.parse(t));

    // ২. ফলো করা সেলিব্রিটিদের টুইট রানটাইমে পুল (Pull) করে নিয়ে আসি
    for (const celebId of followedCelebrities) {
      const celebKey = `${NewsFeedFanoutEngine.CELEB_POSTS_PREFIX}${celebId}`;
      const celebTweetsRaw = await redis.zrevrange(celebKey, 0, limit - 1);
      const celebTweets: Tweet[] = celebTweetsRaw.map((t) => JSON.parse(t));
      tweets.push(...celebTweets);
    }

    // ৩. কম্বাইন্ড টুইটগুলোকে ক্রনোলজিক্যালি সর্ট করে মার্জ করি
    return tweets.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

বাস্তব জীবনের সোশ্যাল নেটওয়ার্কিং স্কেলে এই ৩টি অতি জটিল চ্যালেঞ্জ ও তাদের সল্যুশন:

#### ১. The Celebrity Problem & Write Explosion Mitigation
যদি শুধু **Push Model** ব্যবহার করা হতো, তবে সেলিব্রিটির একটি টুইট কোটি কোটি ইউজারের ক্যাশ আপডেট করতে কয়েক মিনিট লাগিয়ে দিত, যার ফলে লেটেন্সি স্পাইক করত। আবার শুধু **Pull Model** ব্যবহার করলে প্রতি রিডে শত শত ফলোয়ারের টুইট রিড করে সর্ট করা লাগত যা রিড লেটেন্সি বাড়িয়ে দিত।
* **মিটিগেশন (Hybrid Engine):** আমাদের এই হাইব্রিড ইমপ্লিমেন্টেশনই এর সমাধান। সেলিব্রিটিদের আমরা **Pull** মডেলে রাখি আর সাধারণ বন্ধুদের আমরা **Push** মডেলে রাখি। এতে রাইট বিস্ফোরণও ঘটে না, আবার ফিড লোডিং স্পিডও সুপার-ফাস্ট (< ১০০ms) থাকে।

#### ২. Algorithmic Feed Ranking & Scoring Pipeline
আজকের দিনের এক্স (Twitter) বা ফেসবুক কেবল সময় অনুযায়ী পোস্ট দেখায় না, বরং ইউজার কোন পোস্টে লাইক/রিয়্যাক্ট করতে পারে তার ওপর ভিত্তি করে এলগরিদমিক ফিড দেখায়। প্রতিবার ফিড রিকোয়েস্টের সাথে সাথে কোটি কোটি পোস্টের স্কোরিং করা অসম্ভব।
* **মিটিগেশন (Two-Stage Scoring):**
  * **Stage 1 (Candidate Generation):** প্রথমে ক্যাশ থেকে লেটেস্ট ৫০০টি টুইট (নরমাল + সেলিব্রিটি) তুলে আনা হয়।
  * **Stage 2 (Scoring & Ranking):** এই ৫০০টি টুইটকে একটি ডেডিকেটেড **Ranking Service**-এ পাঠানো হয়, যা লাইটওয়েট মেমোরি ফিচার স্টোর (Redis) থেকে ইউজারের ইন্টারেস্ট ডেটা নিয়ে টুইটগুলোর স্কোর ক্যালকুলেট করে। স্কোর অনুযায়ী সর্ট করে টপ ৫০টি টুইট ইউজারকে ম্যাপে রেন্ডার করা হয়।

#### ৩. Cache Stampede & Redis Cold Start Pre-warming
যেহেতু ফিড ফাস্ট দেখানোর জন্য আমরা সম্পুর্ণ ফিড মেমরিতে (Redis) জেনারেট করে রাখি, কোনো কারণে একটি Redis ক্লাস্টার নোড ক্র্যাশ করলে কোটি কোটি ইউজারের ওয়ালেট ডেটা হারিয়ে যাবে। ক্র্যাশের পর যদি সবাই একসাথে ডাটাবেসে রিকোয়েস্ট পাঠায় ফিড রিবিল্ড করার জন্য, তবে মূল ডাটাবেস ক্র্যাশ করবে।
* **মিটিগেশন (Pre-warming Active Users Only):** রেডিস ক্র্যাশ করলে বা নতুন ক্লাস্টার সেটআপ করলে, ব্যাকগ্রাউন্ড ক্রন জব শুধুমাত্র **Active Users** (যারা গত ৩ দিনে লগইন করেছেন) তাদের ফিড ডাটাবেস থেকে রিবিল্ড করে ক্যাশে আগে থেকেই রেডি রাখবে (Pre-warming)। ইন-একটিভ ইউজাররা যখন পরবর্তী সময়ে লগইন করবে, তখন তাদের ফিড অ্যাসিনক্রোনাসলি এবং অলসভাবে (Lazy Load) রিবিল্ড করা হবে।

---

## 📖 Chapter 07: Ticketmaster (High-Concurrency Ticketing Engine)

টিকিট বুকিং সিস্টেমের সবচেয়ে বড় কারিগরি চ্যালেঞ্জ হলো "হটস্পট ইভেন্ট" (যেমন কোনো পপুলার কনসার্টের টিকিট সেল লাইভ হওয়া)। যখন ১০,০০০ সিটের বিপরীতে ১ লাখ ইউজার ঠিক একই সেকেন্ডে সিট বুক করার ট্রাই করেন, তখন সিস্টেম ক্র্যাশ না করে শতভাগ ডাবল বুকিং ফ্রি সিট হোল্ডিং মেকানিজম গড়ে তোলাই হলো স্টাফ আর্কিটেক্টের সার্থকতা।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ইউজার কোনো নির্দিষ্ট ইভেন্ট সার্চ করে তার ফিজিক্যাল সিট ম্যাপ ও এভেইলেবল সিট দেখতে পাবেন।
  - ইউজার সিট সিলেক্ট করে বুকিং ফ্লোতে গেলে সিটটি ১০ মিনিটের জন্য লক/হোল্ড হবে যাতে সে পেমেন্ট কমপ্লিট করতে পারে।
  - অন্য কোনো ইউজার ওই ১০ মিনিট ওই সিটগুলো হোল্ড বা বুক করতে পারবেন না।
  - পেমেন্ট সাকসেসফুল হলে সিটটি পার্মানেন্টলি বুক হবে। ১০ মিনিট পার হলে লক অটোমেটিক এক্সপায়ার হবে এবং সিট আবার ফ্রি হয়ে যাবে।
- **Non-Functional:**
  - **Zero Double-Booking:** একই টিকিট বা সিট কখনই দুজন ইউজারের কাছে বিক্রি করা যাবে না।
  - **High Concurrency Stability:** লাখ লাখ বায়ারের রিয়েল-টাইম হিট হ্যান্ডেল করা এবং ডাটাবেস বটলনেক এড়ানো।
  - **Orphan Lock Prevention:** কোনো সার্ভার বা প্রসেস ক্র্যাশ করলেও যাতে সিট চিরতরে লকড হয়ে না থাকে।

### ২. Back-of-the-envelope Estimation
* **সিলারিটি ইভেন্ট ডেটা:**
  * মোট সিট সংখ্যা = ৫০,০০০
  * টিকেট লঞ্চের ১ম মিনিটে কনকারেন্ট ট্রাফিক = ১,০০০,০০০ একটিভ ইউজার
  * **Peak Search QPS (Read QPS):** **50,000 queries/sec**
  * **Peak Seat Hold QPS (Write QPS):** **20,000 reservations/sec**
* **ডেটাবেস লকিং ওভারহেড:**
  * সেকেন্ডে ২০,০০০ রাইট রিকোয়েস্ট যদি সরাসরি SQL ডাটাবেসে `SELECT ... FOR UPDATE` কুয়েরি ট্রিগার করে, তবে লক কনটেনশনের জন্য ডাটাবেস সম্পূর্ণ জ্যাম হয়ে ক্র্যাশ করবে। তাই লাইভ ইন-মেমোরি সিট হোল্ড মেকানিজম ক্যাশ লেয়ারে সম্পন্ন করতে হবে।

### ৩. API & Database Schema Design
টিকিট বুকিং ও চেকআউট এপিআই ডিজাইন:
- `POST /api/v1/seats/reserve` (সিট ১০ মিনিটের জন্য লক করা)
- `POST /api/v1/payments/confirm` (পেমেন্ট সাকসেস ভ্যালিডেশন এবং ফাইনাল বুকিং)

#### Database Schema (ACID Compliant Relation DB)
সিট বুকিংয়ের ফাইনাল ট্রানজেকশনের জন্য আমরা **PostgreSQL** ডাটাবেস ব্যবহার করব:

```sql
CREATE TABLE events (
    event_id bigint PRIMARY KEY,
    title varchar(255),
    start_time timestamp
);

CREATE TABLE seats (
    seat_id bigint PRIMARY KEY,
    event_id bigint,
    seat_number varchar(10),
    status varchar(20) -- 'AVAILABLE', 'HELD', 'BOOKED'
);

CREATE TABLE reservations (
    reservation_id bigint PRIMARY KEY,
    user_id bigint,
    seat_id bigint,
    status varchar(20), -- 'PENDING', 'CONFIRMED', 'EXPIRED'
    held_until timestamp
);
```

### ৪. High-Level Architecture
টিকিটমাস্টার আর্কিটেকচারে আমরা **Virtual Waiting Room & Atomic Seat Hold** মেকানিজম ব্যবহার করব। নিচে ট্রাফিক ফ্লো দেওয়া হলো:

```mermaid
flowchart TD
    UserClient["User Client App"] -->|1. Request Booking| WaitingRoom["Virtual Waiting Room Queueit CDN Edge"]
    WaitingRoom -->|2. Throttled Traffic Flow| Gateway["API Gateway and Ticket Service"]
    
    Gateway -->|3. Try Seat Hold| CacheLock["Redis Seat Hold Lock Cluster"]
    CacheLock -->|4. Lock Acquired| DB["Postgres DB Relational Transaction"]
    
    Gateway -->|5. Seat Held 10 min| PaymentService["Payment Processing Gateway"]
    PaymentService -->|6. Confirm Payment| DB
    
    CacheLock -.->|7. Expiry Job if payment fails| ExpiryWorker["Expiry Background Worker"]
    ExpiryWorker -.->|8. Release Lock| CacheLock
    ExpiryWorker -.->|9. Mark Seat Available| DB
    
    style UserClient fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style CacheLock fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style DB fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style WaitingRoom fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Redis Lua Seat Reservation
নিচে একটি অত্যন্ত চমৎকার প্রোডাকশন-রেডি **Atomic Ticketing Lock Manager** কোড দেওয়া হলো যা Redis Lua Script ব্যবহার করে ১ মিলি-সেকেন্ডের নিচে ডাবল বুকিং এরর ছাড়া মাল্টিপল সিট এটমিকালি হোল্ড করে:

```typescript
import Redis from "ioredis";

const redis = new Redis();

interface SeatHoldResult {
  success: boolean;
  message: string;
  heldSeatIds?: string[];
  heldUntil?: number;
}

export class TicketingHoldManager {
  private static readonly HOLD_TTL_SECONDS = 600; // ১০ মিনিট

  /**
   * এটমিক সিট হোল্ড করার জন্য LUA স্ক্রিপ্ট জেনারেট করে
   * LUA স্ক্রিপ্ট রেডিসের সিঙ্গেল-থ্রেডেড ইঞ্জিনে ওয়ান-স্টেপ এটমিক ট্রানজেকশন গ্যারান্টি দেয়
   */
  private getHoldLuaScript(): string {
    return `
      local event_id = ARGV[1]
      local ttl = tonumber(ARGV[2])
      local user_id = ARGV[3]
      
      -- ১. সব সিট এভেইলেবল আছে কি না চেক করি
      for i = 1, #KEYS do
        local seat_key = "seat:" .. event_id .. ":" .. KEYS[i]
        local current_lock = redis.call("GET", seat_key)
        if current_lock then
          return redis.error_reply("SEAT_ALREADY_HELD_OR_BOOKED: " .. KEYS[i])
        end
      end
      
      -- ২. সব সিট খালি থাকলে এটমিকালি লক হোল্ড নিই
      local held_until = redis.call("TIME")[1] + ttl
      for i = 1, #KEYS do
        local seat_key = "seat:" .. event_id .. ":" .. KEYS[i]
        redis.call("SET", seat_key, user_id, "EX", ttl)
      end
      
      return tostring(held_until)
    `;
  }

  /**
   * হাই-কনকারেন্ট ট্রাফিকে সিট হোল্ড নিশ্চিত করে
   */
  public async holdSeats(userId: string, eventId: string, seatIds: string[]): Promise<SeatHoldResult> {
    const luaScript = this.getHoldLuaScript();
    
    try {
      // KEYS represent seat IDs, ARGV contains EventID, TTL, and UserID
      const result = await redis.eval(
        luaScript,
        seatIds.length,
        ...seatIds,
        eventId,
        TicketingHoldManager.HOLD_TTL_SECONDS,
        userId
      ) as string;

      return {
        success: true,
        message: "Seats held successfully for 10 minutes.",
        heldSeatIds: seatIds,
        heldUntil: parseInt(result) * 1000, // milliseconds timestamp
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to hold seats due to high concurrency.",
      };
    }
  }

  /**
   * পেমেন্ট সাকসেসফুল হলে সিটগুলো রিলিজ করে ডাটাবেসে বুকড মার্ক করে
   */
  public async confirmSeatBooking(eventId: string, seatIds: string[]): Promise<void> {
    const pipeline = redis.pipeline();
    for (const seatId of seatIds) {
      const seatKey = `seat:${eventId}:${seatId}`;
      pipeline.del(seatKey); // লক রিমুভ করব, ডাটাবেসে পার্মানেন্ট BOOKED আপডেট হবে
    }
    await pipeline.exec();
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

বাস্তব জীবনের প্রোডাকশন সিস্টেমে টিকিট ফেয়ার ম্যাচিং স্কেলিংয়ের ৩টি গুরুত্বপূর্ণ স্টাফ-লেভেল সল্যুশন:

#### ১. Database Lock Contention & Virtual Waiting Rooms (CDN Edge)
এমনকি Redis দিয়ে বুকিং করার পরও, বুকিং পেমেন্ট সাকসেস হওয়ার সাথে সাথে যদি প্রতি সেকেন্ডে ২০,০০০ ইউজার ডাটাবেসে ট্রানজেকশন কমপ্লিট করতে চায়, তবে ডেটাবেসের রাইট-লক কনটেনশন চরম আকার ধারণ করবে।
* **মিটিগেশন (Virtual Waiting Room):** আমরা CDN লেভেলে **Queue-it / Cloudflare Waiting Room** ব্যবহার করে বুকিং ফানেলকে থ্রোটল করব। আমরা শুধুমাত্র প্রতি সেকেন্ডে ৫০০ জন ইউজারকে এপিআই গেটওয়েতে ঢুকতে দেব, যা আমাদের PostgreSQL ডাটাবেসের ম্যাক্সিমাম রাইট ক্যাপাসিটি। বাকি লাখ লাখ ট্রাফিক সিডিএন এজ-এ একটি ডাইনামিক কিউতে ওয়েট করবে, যা ডাটাবেসকে বটলনেক থেকে ১০০% রক্ষা করবে।

#### ২. Expired Holds Handling (The Orphan Lock Problem)
যদি কোনো ইউজার সিট হোল্ড করার পর তার ব্রাউজার ক্র্যাশ করে বা পেমেন্ট উইন্ডো ক্রস করে দেয়, তবে ১০ মিনিট পর Redis থেকে লক অটোমেটিক মুছে যাবে। কিন্তু ডাটাবেসের `reservations` টেবিলে থাকা রোটি পেন্ডিংই থেকে যাবে, যা নোংরা ডাটাবেস হিস্ট্রি তৈরি করে।
* **মিটিগেশন (Active CDC Sync Engine):** আমরা **Redis Keyspace Notifications (`__keyevent@0__:expired`)** ইভেন্ট লিসেনার সেটআপ করব। যখনই রেডিস থেকে কোনো সিট লকের TTL এক্সপায়ার হবে, আমাদের ব্যাকগ্রাউন্ড এক্সপায়ার সার্ভিস সেই নোটিফিকেশন শুনে ডাটাবেসের পেন্ডিং ট্রানজেকশনকে এটমিকালি `EXPIRED` করে সিটের স্ট্যাটাস `AVAILABLE` মার্ক করে দেবে।

#### ৩. Scalper Bots Prevention (Idempotent Cryptographic Tokens)
বট ও স্ক্যালপাররা এপিআই কল বাইপাস করে সেকেন্ডে হাজার হাজার সিট হোল্ড করে নিতে পারে, যার ফলে সাধারণ ক্রেতারা কোনো টিকিটই পায় না।
* **মিটিগেশন (Signed Ticket Tokens):** সিট সিলেক্ট করার সময় সিস্টেম ক্লায়েন্টকে একটি ক্রিপ্টোগ্রাফিকালি সাইনড টোকেন (JWT) দেবে যার ভেতরে ইউজার আইডি, সিট আইডি এবং টাইমস্ট্যাম্প সাইন করা থাকবে। `seats/reserve` এপিআই শুধুমাত্র সেই রিকোয়েস্টই এক্সেপ্ট করবে যেটিতে আমাদের গেটওয়ের দ্বারা সাইন করা ভ্যালিড টোকেন থাকবে। এতে বটস সরাসরি এপিআই স্প্যাম করে টিকিট বুকিং করতে পারবে না।

---

## 📖 Chapter 08: Google Drive & Dropbox (Distributed File Storage Engine)

ডিস্ট্রিবিউটেড ক্লাউড ড্রাইভের মূল ইঞ্জিনিয়ারিং চ্যালেঞ্জ হলো পেটাবাইট স্কেলের ফাইল স্টোরেজ ম্যানেজমেন্ট, ব্যান্ডউইথ অপ্টিমাইজেশন এবং রিয়েল-টাইম ডিস্ট্রিবিউটেড মেটাডাটা সিঙ্ক মেকানিজম গড়ে তোলা। একটি ১ গিগাবাইটের ফাইলের সামান্য ১ কিলোবাইট পরিবর্তন হলে পুরো ফাইল পুনরায় আপলোড না করে কীভাবে নেটওয়ার্ক এবং ক্লাউড কস্ট সাশ্রয় করা যায়, তা নিচে বিশদভাবে বর্ণনা করা হলো।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ইউজার যেকোনো সাইজের ফাইল (সর্বোচ্চ ১০ জিবি) আপলোড, ডাউনলোড ও ডিলিট করতে পারবেন।
  - ডিভাইস সিঙ্ক্রোনাইজেশন: ডিভাইস A-তে কোনো ফাইল আপলোড বা ইডিট হলে তা সাথে সাথে ডিভাইস B-তে ব্যাকগ্রাউন্ডে রিয়েল-টাইমে সিঙ্ক হবে।
  - ফাইল হিস্ট্রি ও ভার্সন কন্ট্রোল: ইউজার আগের ভার্সনগুলো ট্র্যাক করতে এবং রিস্টোর করতে পারবেন।
- **Non-Functional:**
  - **Bandwidth Optimization:** ফাইলের সামান্য ইডিট হলে পুরো ফাইল পুনরায় আপলোড না করে কেবল পরিবর্তিত অংশটুকু আপলোড করা (Chunking)।
  - **Storage Cost Optimization:** মাল্টিপল ইউজারের আপলোড করা হুবহু একই ফাইল রিমুভ করে ডুপ্লিকেশন এড়ানো (Deduplication)।
  - **Consistency:** ফাইল এডিট নিয়ে কনফ্লিক্ট হলে ডেটা লস এড়ানো (Sync Conflict Resolution)।

### ২. Back-of-the-envelope Estimation
* **স্টোরেজ রিকোয়ারমেন্টস (Capacity Estimation):**
  * ডেইলি একটিভ ইউজার (DAU) = ১০ মিলিয়ন
  * এভারেজ আপলোড স্পেস প্রতি ইউজার = ১০ মেগাবাইট / দিন
  * **টোটাল ইনজেস্ট ডেটা/দিন = ১০,০০০,০০০ * ১০ MB =** **100 Terabytes / day**
  * **ডি-ডুপ্লিকেশন সেভ ফ্যাক্টর (Deduplication Saving):** আমাদের ইনজেস্ট করা ডেটার ২০% ফাইল ডুপ্লিকেট থাকে (একই ফটো, ভিডিও বা ফাইল মাল্টিপল ইউজার আপলোড করে)।
  * **নেট প্রয়োজনীয় স্টোরেজ/দিন = ১০০ TB * ০.৮ =** **80 Terabytes / day**
  * **১০ বছরের মোট প্রয়োজনীয় ক্লাউড স্পেস ≈** **292 Petabytes**
* **ব্যান্ডউইথ সাশ্রয়ের হিসাব (Chunk-based Upload):**
  * আমরা ফাইলকে ছোট ছোট **৪ মেগাবাইটের চাঙ্কে (Chunks)** ভাগ করব। যদি কোনো ইউজার তার ১ গিগাবাইটের একটি ফাইলের মাত্র ১টি চাঙ্ক পরিবর্তন করে, তবে চাঙ্কিং করার ফলে পুরো ১ জিবি আপলোডের জায়গায় মাত্র **৪ মেগাবাইট** আপলোড হবে, যা ব্যান্ডউইথ ব্যবহার **৯৯.৬%** কমিয়ে দেয়!

### ৩. API & Database Schema Design
চাঙ্ক ম্যানেজমেন্ট ও মেটাডাটা আপলোডের জন্য ডিজাইন:
- `POST /api/v1/chunks/upload` (৪ মেগাবাইটের চাঙ্ক আপলোড, যেখানে চাঙ্ক আইডি হবে চাঙ্কের SHA-256 হ্যাশ)
- `POST /api/v1/files/commit` (ফাইলের সব চাঙ্ক লিস্ট এবং ফাইল স্ট্রাকচার ডাটাবেসে সেভ করা)

#### Database Schema Design
ফাইলের মেটাডাটা ও চাঙ্কের রিলেশনশিপ ম্যাপ করার জন্য **PostgreSQL** স্কিমা:

```sql
CREATE TABLE files (
    file_id varchar(64) PRIMARY KEY,
    user_id bigint,
    name varchar(255),
    is_directory boolean,
    version int,
    parent_id varchar(64)
);

CREATE TABLE file_chunks (
    file_id varchar(64),
    chunk_hash varchar(64), -- SHA-256
    chunk_order int,
    PRIMARY KEY (file_id, chunk_hash, chunk_order)
);

CREATE TABLE chunk_registry (
    chunk_hash varchar(64) PRIMARY KEY,
    size_bytes int,
    storage_path varchar(512),
    reference_count int -- ডি-ডুপ্লিকেশন ট্র্যাক করার জন্য
);
```

### ৪. High-Level Architecture
ক্লাউড ড্রাইভের মেটাডাটা ট্র্যাকিং ও ক্লাউড স্টোরেজ ফ্লো নিচে চিত্রায়িত করা হলো:

```mermaid
flowchart TD
    ClientApp["Client Device"] -->|1. Check Duplicate Chunks| MetadataServer["Metadata Service"]
    MetadataServer -->|2. Query Hash Registry| HashIndexDB["Postgres Hash Index DB"]
    
    ClientApp -->|3. Upload Unique Chunks| BlockServer["Block Storage Service"]
    BlockServer -->|4. Save Raw Chunks| CloudS3["Cloud Object Storage S3"]
    
    ClientApp -->|5. Commit File Metadata| MetadataServer
    MetadataServer -->|6. Propagate Sync Event| SyncService["Sync Notification Service"]
    SyncService -->|7. Push Live Sync Notification| ClientDeviceB["Target Sync Device B"]
    
    style ClientApp fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style MetadataServer fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style CloudS3 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style ClientDeviceB fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Chunk Upload & Deduplication Engine
নিচে একটি প্রোডাকশন-রেডি **Chunk Deduplication Manager** কোড দেওয়া হলো যা আপলোড করা বাফারের SHA-256 হ্যাশ বের করে এবং ইউনিক চাঙ্কগুলো অবজেক্ট স্টোরেজে (AWS S3) পাঠায় ও ডুপ্লিকেট চাঙ্ক আপলোড স্কিপ করে:

```typescript
import * as crypto from "crypto";

interface ChunkUploadResponse {
  chunkHash: string;
  isDuplicate: boolean;
  uploadedPath?: string;
}

export class ChunkDeduplicationManager {
  // মেমোরি রেজিস্ট্রি ইনডেক্স (বাস্তব প্রোডাকশনে PostgreSQL chunk_registry টেবিলে যাবে)
  private chunkRegistry = new Map<string, { storagePath: string; refCount: number }>();

  /**
   * ফাইল বাফারের SHA-256 হ্যাশ বের করে চাঙ্ক আইডি হিসেবে ব্যবহারের জন্য
   */
  public computeSHA256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * ৪ মেগাবাইটের ফাইল চাঙ্ক প্রসেস করে
   * হ্যাশ ডুপ্লিকেট হলে আপলোড স্কিপ করে ব্যান্ডউইথ ও মেমোরি সেভ করে
   */
  public async uploadChunk(chunkBuffer: Buffer, userId: string): Promise<ChunkUploadResponse> {
    const hash = this.computeSHA256(chunkBuffer);
    const existingChunk = this.chunkRegistry.get(hash);

    if (existingChunk) {
      // 🟢 Deduplication Hit: ফাইল ব্লকটি সার্ভারে অলরেডি আপলোড হয়ে গেছে!
      // আমরা নতুন করে আপলোড না করে কেবল রেফারেন্স কাউন্ট ১ বাড়িয়ে দেব
      existingChunk.refCount += 1;
      this.chunkRegistry.set(hash, existingChunk);
      
      return {
        chunkHash: hash,
        isDuplicate: true,
        uploadedPath: existingChunk.storagePath,
      };
    }

    // 🔴 Deduplication Miss: ফাইল ব্লকটি একদম নতুন ও ইউনিক!
    // আমরা ফাইল ব্লকটি ক্লাউড অবজেক্ট স্টোরেজে (AWS S3) সেভ করব
    const dummyStoragePath = `s3://cloud-drive-bucket/chunks/${hash.slice(0, 2)}/${hash}.bin`;
    
    // ফাইল ইনডেক্সে সেভ করি
    this.chunkRegistry.set(hash, {
      storagePath: dummyStoragePath,
      refCount: 1,
    });

    return {
      chunkHash: hash,
      isDuplicate: false,
      uploadedPath: dummyStoragePath,
    };
  }

  /**
   * ফাইলের চাঙ্কের রেফারেন্স রিলিজ করে
   * রেফারেন্স কাউন্ট ০ হলে চাঙ্কটি অবজেক্ট স্টোরেজ থেকে ডিলিট করা হবে (Garbage Collector)
   */
  public async releaseChunk(hash: string): Promise<void> {
    const chunk = this.chunkRegistry.get(hash);
    if (!chunk) return;

    chunk.refCount -= 1;
    if (chunk.refCount <= 0) {
      // S3 স্টোরেজ থেকে ফাইল মুছে ফেলার ব্যাকগ্রাউন্ড ইভেন্ট জেনারেট হবে
      this.chunkRegistry.delete(hash);
      console.log(`Garbage Collector: Deleted chunk ${hash} from S3 storage.`);
    } else {
      this.chunkRegistry.set(hash, chunk);
    }
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

পেটাবাইট স্কেলের ডিস্ট্রিবিউটেড ফাইল সিস্টেমে প্রোডাকশনের ৩টি জটিল প্রবলেম ও স্টাফ-লেভেল সল্যুশন:

#### ১. Dynamic Sync Conflicts (Optimistic Concurrency Control)
যখন দুজন কোলাবোরেটর অফলাইন অবস্থায় একই এক্সেল শিট মডিফাই করেন এবং পরবর্তীতে অনলাইনে ফিরে আসেন, তখন ডিভাইস B ডিভাইস A-এর ফাইল ওভাররাইট করে ডেটা লস ঘটাতে পারে।
* **মিটিগেশন (Optimistic Concurrency Control - OCC):** মেটাডাটা সার্ভারে আমরা প্রতিটি ফাইলের সাথে একটি `version` নাম্বার ট্র্যাক করব। যখন ডিভাইস B ফাইল সিঙ্ক করার রিকোয়েস্ট পাঠাবে, তাকে তার লাস্ট ডাউনলোড করা ভার্সন নাম্বারটি দিতে হবে। যদি ডাটাবেসের কারেন্ট ভার্সন অলরেডি আপডেট হয়ে থাকে (যেমন ডিভাইস A আগে কমপ্লিট করেছে), তবে সার্ভার `409 Conflict` রেসপন্স দেবে। ক্লায়েন্ট ডিভাইস তখন ইউজারের কাছে কনফ্লিক্ট দেখাবে এবং ২ ফাইল মার্জ বা আলাদা দুটি কপি সেভ করার ডিসিশন নেবে।

#### ২. Petabyte Scale Cost Optimization (Cold vs Hot Storage Lifecycle)
ইনজেস্ট করা ফাইলগুলোর ৯০% আপলোডের ৩০ দিন পার হয়ে যাওয়ার পর আর কখনই কোনো ইউজার রিড বা অ্যাক্সেস করে না। পেটাবাইট স্কেলের ডেটা হাই-পারফরম্যান্স SSD তে বছরের পর বছর রেখে দেওয়া লাখ লাখ টাকার ক্লাউড লস।
* **মিটিগেশন (Storage Class Lifecycle Policies):** আমরা একটি অটোমেটেড পলিসি জেনারেট করব যা প্রতি ৩০ দিন পর পর আন-অ্যাক্সেসড চাঙ্কগুলোকে **S3 Standard (Hot)** থেকে **S3 Standard-IA (Infrequent Access)** এ পাঠাবে। এবং ৯০ দিন পর ফাইলগুলোকে **AWS S3 Glacier Deep Archive (Cold Storage)** ক্লাসে ট্রান্সফার করবে। এতে আমাদের মান্থলি ক্লাউড বিল **৮০% পর্যন্ত হ্রাস** পাবে।

#### ৩. Deduplication Cross-User Side-Channel Exploit (Security Leak)
কোনো ইউজার একটি সিক্রেট ফাইল আপলোড করার সময় সিস্টেম যদি সাথে সাথে বলে "File already exists (Upload skipped)", তবে ওই ইউজার সাথে সাথে টের পেয়ে গেল যে আমাদের ড্রাইভ সার্ভারে অন্য কেউ ঠিক একই ফাইলটি অলরেডি স্টোর করে রেখেছে! এটি একটি মারাত্মক ইনফরমেশন লিক সিকিউরিটি হোল।
* **মিটিগেশন (Proof of Custody - PoC):** ক্লায়েন্ট কেবল ফাইলের SHA-256 হ্যাশ পাঠাবে না। সার্ভার ক্লায়েন্টকে একটি চ্যালেঞ্জ পাঠাবে (যেমন: "ফাইলের ১০ম বাইট থেকে ১০০তম বাইটের র্যান্ডম হ্যাশ ক্যালকুলেট করে দেখাও")। এটি প্রমাণ করে যে ফাইলটি আসলেই ক্লায়েন্ট ডিভাইসে ফিজিক্যালি উপস্থিত আছে এবং কেবল ডোপ অনুমান করে হ্যাশ পাঠানো হচ্ছে না। একেই বলে **Proof of Custody (PoC)**।

---

## 📖 Chapter 09: Web Crawler (Search Engine Indexer)

গুগল বা বিং-এর মতো সার্চ ইঞ্জিনের জন্য কোটি কোটি ওয়েব পেজ অটোমেটিকভাবে ক্রল করা এবং ইনডেক্সিং পাইপলাইনে পাঠানো অত্যন্ত জটিল একটি কাজ। বিলিয়ন স্কেলে ওয়েব ক্রলিংয়ের মূল কারিগরি চ্যালেঞ্জ হলো গ্রাফ ট্রাভার্সাল (BFS), ডোমেইন পোলাইটনেস (Politeness), Robots.txt সম্মান করা এবং ইনফিনিট স্পাইডার ট্র্যাপ বা রিডাইরেকশন লুপ প্রিভেন্ট করা।

### ১. রিকোয়ারমেন্টস (Scope)
- **Functional:**
  - ওয়েব পেজ থেকে কন্টেন্ট ডাউনলোড এবং তার ভেতরের সব হাইপারলিঙ্ক (`<a href="...">`) এটমিকালি এক্সট্র্যাক্ট করা।
  - ডাউনলোড করা কন্টেন্ট ক্লাউড অবজেক্ট স্টোরেজে (S3) সেভ করা এবং টেক্সট ডেটা সার্চ ইনডেক্সারে পুশ করা।
  - প্রতিটি ডোমেইনের **Robots.txt** রুলস পড়া ও কঠোরভাবে মেনে চলা।
- **Non-Functional:**
  - **Massive Scalability:** প্রতি মাসে ১৫ বিলিয়ন (15 Billion) পেজ ক্রল করার ক্ষমতা থাকতে হবে।
  - **Strict Domain Politeness:** কোনো ওয়েবসাইটকে অতিরিক্ত রিকোয়েস্ট পাঠিয়ে যাতে ডাউন না করা হয় (DoS Attack প্রিভেনশন)।
  - **High Fault Tolerance:** ডেড লিংক, স্লো রেসপন্স, ৪MB পেজ সাইজ এবং মাল্টিপল রিডাইরেকশন এরর সুন্দরভাবে হ্যান্ডেল করা।

### ২. Back-of-the-envelope Estimation
* **ক্রলার থ্রুপুট (Page Crawl QPS):**
  * মাসিক ক্রল টার্গেট = ১৫ বিলিয়ন পেজ
  * দৈনিক ক্রল রেট = ১৫,০০০,০০০,০০০ / ৩০ দিন = ৫০০,০০০,০০০ পেজ / দিন
  * **Crawl Download QPS = ৫০০,০০০,০০০ / ৮৬,৪০০ সেকেন্ড ≈** **5,800 pages/sec (Average)**
* **স্টোরেজ রিকোয়ারমেন্টস (Raw HTML Cache - 1 Year):**
  * এভারেজ পেজ সাইজ = ১০০ কিলোবাইট
  * দৈনিক ইনজেস্ট স্পেস = ৫০০,০০০,০০০ * ১০০ KB = **50 Terabytes / day**
  * **১ বছরের টোটাল প্রয়োজনীয় মেমোরি ≈** **18 Petabytes** (তাই S3 Glacier বা অবজেক্ট স্টোরেজ ব্যবহার মাস্ট)।
* **DNS রিজলভার ওভারহেড:**
  * সেকেন্ডে ৫,৮০০ পেজ ক্রল করার অর্থ হলো প্রতি সেকেন্ডে ৫,৮০০ টি DNS রিজলভিং কুয়েরি জেনারেট হওয়া। এটি গ্লোবাল পাবলিক DNS-এ পাঠালে সাথে সাথে আমাদের ব্লক করে দেবে। তাই একটি লোকাল ডিস্ট্রিবিউটেড DNS ক্যাশিং সার্ভার ম্যান্ডেটরি।

### ৩. API & Database Schema Design
ডিস্ট্রিবিউটেড ক্রলাররা ব্যাকগ্রাউন্ড ডেমো ওয়ার্কার হিসেবে কাজ করে, তাই তাদের কোনো ডিরেক্ট ইউজার ফেসড API থাকে না। তারা **Frontier Queue** থেকে ইনপুট নেয় ও প্রসেসিং আউটপুট দেয়।

#### Database Tables Schema (Crawl Frontier Storage)
ডিজিটাল ইউআরএল-এর স্টেট এবং প্রায়োরিটি ট্র্যাক করার জন্য ডিস্ট্রিবিউটেড **PostgreSQL/Cassandra** নোএসকিউএল ইনডেক্স:

```sql
CREATE TABLE crawl_frontier (
    url_hash varchar(64) PRIMARY KEY,
    url varchar(2048),
    domain varchar(255),
    status varchar(20), -- 'DISCOVERED', 'IN_PROGRESS', 'CRAWLED', 'FAILED'
    last_crawled_at timestamp,
    priority int
);

CREATE TABLE robots_cache (
    domain varchar(255) PRIMARY KEY,
    rules_text text,
    expires_at timestamp
);
```

### ৪. High-Level Architecture
ডিস্ট্রিবিউটেড ক্রলিং ফ্লো ও ডি-ডুপ্লিকেশন পাইপলাইন নিচে চিত্রায়িত করা হলো:

```mermaid
flowchart TD
    Frontier["Crawl Frontier URL Queue"] -->|1. Fetch Next URL| PolitenessQueue["Politeness Queue Manager Redis Domain Queues"]
    PolitenessQueue -->|2. Get Safe Host URL| CrawlWorker["Distributed Crawl Workers"]
    
    CrawlWorker -->|3. DNS Resolve Check| DNSCache["Local Caching DNS Server"]
    CrawlWorker -->|4. Request robots.txt| TargetServer["Target Web Server"]
    
    CrawlWorker -->|5. Download HTML| HTMLParser["HTML Parser and Link Extractor"]
    
    HTMLParser -->|6. Save Raw Page| RawStore["Cloud Object Storage S3"]
    HTMLParser -->|7. Discovered Links| DedupeService["URL Deduplication Filter SHA256"]
    
    DedupeService -->|8. New Unique URLs| Frontier
    
    style Frontier fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style DNSCache fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style HTMLParser fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style RawStore fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
```

### 💻 Practical TypeScript Politeness and Robots.txt Manager
নিচে একটি প্রোডাকশন-রেডি **Crawl Politeness Manager** কোড দেওয়া হলো যা Redis ক্যাশ ব্যবহার করে Robots.txt-এর রুলস ভ্যালিডেট করে এবং ডোমেইন প্রতি ২ সেকেন্ডের লকিং পোলাইটনেস এনফোর্স করে:

```typescript
import Redis from "ioredis";

const redis = new Redis();

interface CrawlTask {
  url: string;
  domain: string;
}

export class CrawlPolitenessManager {
  private static readonly POLITENESS_DELAY_MS = 2000; // একই ডোমেইনে সর্বোচ্চ ১টি রিকোয়েস্ট প্রতি ২ সেকেন্ডে
  private static readonly DISALLOWED_ROBOTS_KEY = "robots:disallowed:";

  /**
   * ইউআরএল থেকে ডোমেইন এক্সট্র্যাক্ট করে
   */
  public extractDomain(urlStr: string): string {
    try {
      const url = new URL(urlStr);
      return url.hostname;
    } catch {
      return "";
    }
  }

  /**
   * Robots.txt ভ্যালিডেট করে পাথ অ্যালাউড কি না নিশ্চিত করে
   */
  public async isUrlAllowed(urlStr: string): Promise<boolean> {
    const domain = this.extractDomain(urlStr);
    if (!domain) return false;

    // Robots disallow list loaded from Redis cache
    const disallowRules = await redis.smembers(`${CrawlPolitenessManager.DISALLOWED_ROBOTS_KEY}${domain}`);
    
    const url = new URL(urlStr);
    for (const rule of disallowRules) {
      if (url.pathname.startsWith(rule)) {
        console.log(`Crawl Blocked: Robots.txt disallows path ${url.pathname} on ${domain}`);
        return false;
      }
    }
    return true;
  }

  /**
   * পোলাইটনেস লক অ্যাকোয়ার করে
   * নির্দিষ্ট ডোমেইনে ২ সেকেন্ডের মধ্যে অন্য কোনো ক্রলার রিকোয়েস্ট পাঠাতে পারবে না
   */
  public async acquireCrawlPermission(domain: string): Promise<boolean> {
    const lockKey = `crawl:lock:domain:${domain}`;
    
    // NX: key না থাকলে সেট হবে, EX: ২ সেকেন্ডের জন্য লক থাকবে
    const lock = await redis.set(lockKey, "ACTIVE", "NX", "PX", CrawlPolitenessManager.POLITENESS_DELAY_MS);
    
    if (lock === "OK") {
      return true; // লক সাকসেস!
    }
    
    return false; // লক ফেইল! পোলাইটনেস ভায়োলেশন এড়াতে হোল্ড করা হবে
  }

  /**
   * ডোমেইনে অফলাইন রুল রেজিস্টার করে
   */
  public async registerDisallowedPath(domain: string, path: string): Promise<void> {
    await redis.sadd(`${CrawlPolitenessManager.DISALLOWED_ROBOTS_KEY}${domain}`, path);
  }
}
```

### 🛑 Staff Architect Edge Cases & Scaling Gaps

বিলিয়ন-স্কেল ক্রলিং ইঞ্জিনে প্রোডাকশনে ফেস করা ৩টি চরম প্রবলেম ও তাদের সল্যুশন:

#### ১. DNS Resolution Bottleneck (Network Blockages)
সেকেন্ডে ৫,৮০০ রিকোয়েস্ট প্রসেস করতে গেলে সমপরিমাণ DNS Lookup করতে হয়। যেহেতু DNS Resolution একটি সিঙ্ক্রোনাস এবং ব্লকিং অপারেশন, এটি বাইরের পাবলিক DNS এ পাঠালে লেটেন্সি ৫ সেকেন্ড পার হয়ে যাবে এবং আইপি ব্লক খাবে।
* **মিটিগেশন (DNS Caching & Asynchronous Resolvers):** আমরা আমাদের ডিস্ট্রিবিউটেড নেটওয়ার্ক পডগুলোতে লোকাল ক্যাশিং DNS সার্ভার (যেমন **Unbound / CoreDNS**) ডেপ্লয় করব। আমাদের ক্রলিং ইঞ্জিন ডিরেক্টলি লোকাল ক্যাশ থেকে IP রিজলভ করবে। এছাড়া অ্যাসিঙ্ক্রোনাস এবং নন-ব্লকিং DNS কুয়েরি মেকানিজম ব্যবহার করা হবে যাতে একটি থ্রেড DNS রিজলভিং-এর জন্য ঝুলে না থাকে।

#### ২. Spider Traps & Dynamic Path Loops
কিছু ওয়েবসাইট ডাইনামিকালি ইনফিনিট ক্যালেন্ডার বা রিডাইরেকশন লুপ তৈরি করে (যেমন: `/calendar/2026/next-day` যা অফুরন্ত লিংক জেনারেট করে)। ক্রলার এর ভেতরে ঢুকে পড়লে একই সাইটের মিলিয়ন লিংকে ঘুরে রিসোর্স নষ্ট করবে।
* **মিটিগেশন (Depth Limiting & Bloom Filter Hash Check):** আমরা দুটি ফিল্টার বসাব:
  * **Max Depth Guard:** যেকোনো ওয়েবসাইটের জন্য BFS ডেপথ সর্বোচ্চ ১৫ লেয়ারে লক করে দেওয়া হবে।
  * **Bloom Filter Document Duplication:** একটি পেজ ডাউনলোডের পর তার HTML কন্টেন্টকে হ্যাশ করব। ব্লুম ফিল্টার দিয়ে যদি দেখি একই ডোমেইনের কন্টেন্ট হ্যাশ ৫ বারের বেশি ডুপ্লিকেট হচ্ছে (ভিন্ন ইউআরএল-এর অধীনে), তবে বুঝবো এটি একটি স্পাইডার ট্র্যাপ এবং সেই ডোমেইন ক্রলিং করা সাথে সাথে ব্ল্যাকলিস্ট করব।

#### ৩. Crawl Politeness Queue Skewing (Host-based Queues)
একটি সিঙ্গেল প্রসেসিং কিউ ব্যবহার করলে মাল্টিপল ক্রলার থ্রেড একই সময়ে একই ডোমেইনের (যেমন `wikipedia.org`) মাল্টিপল লিংক তুলে আনতে পারে, যার ফলে পোলাইটনেস রুল ব্রেক হবে এবং আইপি ব্যান খাবে।
* **মিটিগেশন (Host-based Sub-Queues):** আমরা Crawl Frontier-কে Domain Name অনুযায়ী শার্ডিং করব। প্রতিটি ডোমেইনের জন্য আলাদা ডেডিকেটেড FIFO সাব-কিউ থাকবে। একটি সেন্ট্রাল **Queue Coordinator** প্রতি সাব-কিউ-এর বিপরীতে **ঠিক একটি মাত্র ক্রলিং থ্রেড** অ্যাসাইন করবে। এর ফলে একটি ডোমেইনে কখনো প্যারালাল রিকোয়েস্ট যাবে না, যা নিখুঁত পোলাইটনেস এনশিওর করবে।

---

## 🔒 Chapters 10 - 20: Syllabus Blueprint (Ready to Unlock)

বাকি ১১টি চ্যাপ্টার সম্পূর্ণ ইন্টারেক্টিভ লার্নিংয়ের জন্য সাজানো হয়েছে। আপনি যে টপিকটি শিখতে চান, জাস্ট আমাকে মেনশন করলেই আমরা সেটির রিকোয়ারমেন্ট অ্যানালাইসিস, ক্যাপাসিটি ক্যালকুলেশন, মারমেইড আর্কিটেকচার ডায়াগ্রাম এবং প্র্যাক্টিক্যাল কোডসহ ডিপ-ডাইভ করে চ্যাপ্টারটি আনলক করে ফেলবো!

যেমন:
- **চ্যাপ্টার ১০ (Distributed Notification System):** জানবো কীভাবে প্রায়োরিটি কিউ ব্যবহার করে পুশ নোটিফিকেশন মিলি-সেকেন্ডে পাঠাতে হয়।
- **চ্যাপ্টার ১১ (API Gateway):** বুঝবো কীভাবে Redis Lua দিয়ে হাই-স্পিড ডিস্ট্রিবিউটেড রেট লিমিটিং করতে হয়।

---

> **💡 পরবর্তী অ্যাকশন:** অভিনন্দন, আমরা সফলভাবে **Chapter 09 (Web Crawler Search Engine Indexer)** আনলক করে ফেলেছি! আমরা কি এখন আমাদের রোডম্যাপ অনুযায়ী **Chapter 10 (Distributed Notification System)** নিয়ে ডিপ-ডাইভ শুরু করবো, নাকি এর বাইরে অন্য কোনো টপিক আনলক করতে চান? Let's discuss and design!
