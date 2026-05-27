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
| **04** | WhatsApp & Messenger | 🔒 *Locked* | WebSockets, Message Gateway, Cassandra Store, Push Notifications |
| **05** | Uber & Grab (Ride-Sharing) | 🔒 *Locked* | Geospatial Indexing (Geohash/H3), Quadtree, Pub/Sub Engine |
| **06** | Twitter/X (News Feed & Timeline) | 🔒 *Locked* | Fanout-on-write vs Fanout-on-read, Push vs Pull |
| **07** | Ticketmaster (Ticketing Engine) | 🔒 *Locked* | High-Concurrency Booking, Distributed Locking, Queueing System |
| **08** | Google Drive / Dropbox | 🔒 *Locked* | Chunk-based uploads, Metadata Sync, Keep-Alive/Long Polling |
| **09** | Web Crawler (Search Engine Indexer) | 🔒 *Locked* | BFS Graph Traversal, Robots.txt Parser, Deduplication Pipeline |
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

## 🔒 Chapters 04 - 20: Syllabus Blueprint (Ready to Unlock)

বাকি ১৭টি চ্যাপ্টার সম্পূর্ণ ইন্টারেক্টিভ লার্নিংয়ের জন্য সাজানো হয়েছে। আপনি যে টপিকটি শিখতে চান, জাস্ট আমাকে মেনশন করলেই আমরা সেটির রিকোয়ারমেন্ট অ্যানালাইসিস, ক্যাপাসিটি ক্যালকুলেশন, মারমেইড আর্কিটেকচার ডায়াগ্রাম এবং প্র্যাক্টিক্যাল কোডসহ ডিপ-ডাইভ করে চ্যাপ্টারটি আনলক করে ফেলবো!

যেমন:
- **চ্যাপ্টার ০৪ (WhatsApp):** শিখবো কীভাবে WebSockets এবং Redis Pub/Sub দিয়ে রিয়েল-টাইম মেসেজিং গেটওয়ে তৈরি করতে হয় এবং Cassandra বা ScyllaDB-তে কীভাবে ক্লিক-টু-রিড লেটেন্সি কমানো যায়।
- **চ্যাপ্টার ০৫ (Uber):** বুঝবো কীভাবে Google maps-এর মতো রিয়েল-টাইম ড্রাইভারদের Geolocation ট্র্যাক করা যায় **H3 Geohash Grid** বা **Quadtree** ডাটা স্ট্রাকচার দিয়ে।
- **চ্যাপ্টার ০৬ (Twitter):** জানবো কেন সেলিব্রিটিদের টুইট ফিড এবং আমাদের নরমাল ইউজারদের টুইট ফিড তৈরিতে সম্পূর্ণ আলাদা **Push vs Pull (Fanout)** আর্কিটেকচার ব্যবহার করতে হয়।

---

> **💡 পরবর্তী অ্যাকশন:** আপনি কি আমাদের এই ২০টি টপিকের রোডম্যাপ এপ্রুভ করছেন? আমরা কি এখন **Chapter 04 (WhatsApp/Messenger Real-time System)** নিয়ে ডিপ-ডাইভ করে সেটি আনলক করবো, নাকি এর মধ্য থেকে আপনার কোনো ফেভারিট কাস্টম টপিক শুরু করবো? Let's discuss and design!
