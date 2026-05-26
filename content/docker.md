---
title: 'Docker & Containerization Internals'
description: 'Linux Namespaces, cgroups, OverlayFS, Docker Engine (containerd, runc), networking, storage internals, এবং প্রোডাকশন গ্রেড অপ্টিমাইজেশন নিয়ে একটি ইন-ডেপথ আর্কিটেকচার বুক।'
category: 'DevOps & System Design'
---

# Docker & Containerization Internals: Deep Architectural Manual

আধুনিক ক্লাউড-নেটিভ সফটওয়্যার আর্কিটেকচারে কন্টেইনারাইজেশন একটি অনস্বীকার্য স্ট্যান্ডার্ড। তবে বেশিরভাগ ডেভেলপার কেবল `docker run` এবং `docker build` কমান্ডের মধ্যেই সীমাবদ্ধ থাকেন। আপনি যদি একজন সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার, সিস্টেম স্থপতি (System Architect) বা ডেভঅপ্স স্পেশালিস্ট হতে চান, তবে কার্নেল লেভেলে ডকার কীভাবে কাজ করে, এর সিকিউরিটি বাউন্ডারি এবং নেটওয়ার্কিং ও স্টোরেজের ভেতরের গভীর মেকানিজম জানা অপরিহার্য।

এই গাইডবুকে আমরা ডকারের একদম কোর আর্কিটেকচার, লিনাক্স কার্নেলের সাথে এর নিবিড় সংযোগ, নেটওয়ার্কিং-স্টোরেজ ড্রাইভের মেকানিক্স এবং প্রোডাকশন-গ্রেড ডকার ফাইল অপ্টিমাইজেশনের প্রতিটি বিষয় প্রফেশনাল ডেপথ ও মারমেইড ডায়াগ্রামের মাধ্যমে উন্মোচন করব।

---

## ১. Virtual Machines vs. Containers: The Core Battle

কন্টেইনারের গভীর মেকানিজম বোঝার আগে এটি ভার্চুয়াল মেশিনের (VM) চেয়ে কেন শতগুণ দ্রুত ও লাইটওয়েট, তা জানা প্রয়োজন।

### Hypervisor-Based Virtualization (VM)

ভার্চুয়াল মেশিনে হার্ডওয়্যারের ওপর একটি **Hypervisor** (যেমন: ESXi, KVM, VirtualBox) রান করে। এটি প্রতিটা ভিএম-এর জন্য ফিজিক্যাল রিসোর্সকে ভার্চুয়ালাইজ করে সম্পূর্ণ আলাদা **Guest OS** ইনস্টল করে।

- **ওভারহেড:** প্রতিটা ভিএম-এর নিজস্ব কার্নেল, মেমরি ম্যানেজমেন্ট, ডিভাইস ড্রাইভার এবং ইনিট সিস্টেম থাকে। এর ফলে একটি ছোট অ্যাপ্লিকেশন চালাতেও কয়েক গিগাবাইট র‍্যাম এবং বুট হতে কয়েক মিনিট সময় নষ্ট হয়।

### Containerization (OS-Level Virtualization)

ডকার বা কন্টেইনারে কোনো হাইপারভাইজার বা গেস্ট ওএস থাকে না। কন্টেইনারগুলো সরাসরি **Host OS-এর Kernel** শেয়ার করে চলে। ডকার ইঞ্জিন কার্নেলের ফিচার ব্যবহার করে প্রসেসগুলোকে এমনভাবে আইসোলেট করে যাতে তারা মনে করে তারা সম্পূর্ণ পৃথক মেশিনে আছে।

- **ওভারহেড:** যেহেতু কোনো গেস্ট ওএস নেই, তাই অতিরিক্ত কোনো কার্নেল মেমরি ওভারহেড থাকে না। কন্টেইনার বুট হওয়া মানে স্রেফ একটি সাধারণ হোস্ট প্রসেস শুরু হওয়া, যা মাত্র কয়েক মিলি-সেকেন্ডে ঘটে।

```mermaid
flowchart TD
    subgraph VM_Arch [Virtual Machine Architecture]
        direction TB
        VM_App["Application Code"]
        VM_Guest["Guest OS <br>(Full Kernel & Libraries)"]
        VM_Hyper["Hypervisor / VMM <br>(Type 1 or 2)"]
        VM_Host["Host OS & Kernel"]
        VM_HW["Physical Hardware"]

        VM_App --> VM_Guest
        VM_Guest --> VM_Hyper
        VM_Hyper --> VM_Host
        VM_Host --> VM_HW
    end

    subgraph Container_Arch [Docker Container Architecture]
        direction TB
        Docker_App["Application Code"]
        Docker_Bins["Minimal Bins / Libs"]
        Docker_Engine["Docker Engine <br>(containerd / runc)"]
        Docker_Host["Shared Host OS & Kernel"]
        Docker_HW["Physical Hardware"]

        Docker_App --> Docker_Bins
        Docker_Bins --> Docker_Engine
        Docker_Engine --> Docker_Host
        Docker_Host --> Docker_HW
    end

    style VM_Guest fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style VM_Hyper fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style Docker_Engine fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style Docker_Host fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

### VM vs. Container Detailed Comparison

| Feature                 | Virtual Machines (VMs)                                 | Containers (Docker)                               |
| :---------------------- | :----------------------------------------------------- | :------------------------------------------------ |
| **Architectural Core**  | Hardware-level Virtualization (Hypervisor)             | OS-level Virtualization (Shared Host Kernel)      |
| **Guest OS**            | প্রতিটা VM-এর নিজস্ব পূর্ণাঙ্গ Guest OS থাকে।          | কোনো Guest OS থাকে না, হোস্টের কার্নেল শেয়ার করে। |
| **Startup Time**        | কয়েক মিনিট (কার্ডওয়্যার বুট ও কার্নেল ইনিশিয়ালাইজেশন)। | মিলি-সেকেন্ড (স্রেফ একটি লিনাক্স প্রসেস ট্রিগার)। |
| **Memory Footprint**    | কয়েক গিগাবাইট (GB)।                                    | কয়েক মেগাবাইট (MB)।                               |
| **Resource Efficiency** | কম (রিসোর্স আগে থেকেই ফিক্সড ব্লক হিসেবে বুকড থাকে)।   | অত্যন্ত বেশি (ডায়নামিক এলোকেশন ও শেয়ারিং)।        |
| **Isolation Level**     | অত্যন্ত স্ট্রং (হার্ডওয়্যার বাউন্ডারি আইসোলেশন)।       | মিডিয়াম/স্ট্রং (প্রসেস বাউন্ডারি আইসোলেশন)।       |

---

## ২. Under the Hood: Container Core Mechanisms

লিনাক্স কার্নেল লেভেলে "কন্টেইনার" নামের কোনো ফিজিক্যাল অস্তিত্ব নেই। এটি মূলত ৩টি লিনাক্স কার্নেল টেকনোলজির সমন্বয়ে তৈরি একটি শক্তিশালী স্যান্ডবক্স:

```mermaid
flowchart TD
    subgraph ContainerStructure [What is a Container?]
        Container["Docker Container <br>(Logical Boundary)"]

        NS["1. Namespaces <br>(What you can SEE)"]
        CG["2. Control Groups - cgroups <br>(What you can USE)"]
        OverlayFS["3. UnionFS / OverlayFS <br>(What you can ACCESS)"]

        Container --> NS
        Container --> CG
        Container --> OverlayFS
    end

    style Container fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style NS fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style CG fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style OverlayFS fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

### ১. Namespaces: Virtualizing Viewports (আইসোলেশন)

নেমস্পেস হলো ওএস লেভেলে একটি প্রসেসকে সম্পূর্ণ আইসোলেটেড ভিউ পোর্ট দেওয়া। এর মাধ্যমে প্রসেসটি মনে করে সে হোস্টের একমাত্র বাসিন্দা। ডকার মূলত ৬টি প্রধান লিনাক্স নেমস্পেস ব্যবহার করে:

- **PID Namespace (Process ID):** কন্টেইনারের ভেতরের মেইন প্রসেসটি মনে করে তার আইডি ১ (PID 1), যদিও হোস্ট মেশিনে তার আইডি হয়তো ১৫৭৩০। সে হোস্টের অন্য কোনো প্রসেস দেখতে বা সিগন্যাল পাঠাতে পারে না।
- **NET Namespace (Network):** কন্টেইনারকে তার নিজস্ব ভার্চুয়াল নেটওয়ার্ক ডিভাইস, আইপি রুট, পোর্ট রেঞ্জ এবং আইপি টেবিল দেয়।
- **MNT Namespace (Mount):** কন্টেইনারকে সম্পূর্ণ নিজস্ব ডিরেক্টরি ট্রি এবং মাউন্ট পয়েন্ট ফাইলসিস্টেম দেয়। এর ফলে কন্টেইনার হোস্টের রুট ফাইল দেখতে পারে না।
- **IPC Namespace (Inter-Process Communication):** প্রসেসগুলোর মধ্যে শেয়ার্ড মেমরি বা মেসেজ কিউ আইসোলেট করে, যাতে অন্য কন্টেইনার ডেটা রিড করতে না পারে।
- **UTS Namespace (UNIX Timesharing System):** কন্টেইনারকে নিজস্ব হোস্টনেম এবং ডোমেননেম সেট করার পারমিশন দেয়।
- **USER Namespace:** কন্টেইনারের ভেতরের নন-রুট ইউজারকে হোস্ট ওএস-এর রুট প্রিভিলেজ ছাড়া স্যান্ডবক্সের ভেতরে রুট (UID 0) হিসেবে অ্যাক্ট করার সুবিধা দেয়।

---

### ২. Control Groups (cgroups): Resource Constraint (রিসোর্স লিমিট)

নেমস্পেস দিয়ে আইসোলেট করলেও একটি কন্টেইনার হোস্টের সম্পূর্ণ সিপিইউ, র‍্যাম বা ডিস্ক I/O একাই খেয়ে হোস্ট ক্র্যাশ করাতে পারে। এই রিসোর্স ম্যানেজ ও কন্ট্রোল করার জন্য কার্নেলের **Control Groups (cgroups)** ব্যবহৃত হয়।
cgroups দিয়ে আমরা ডিফাইন করতে পারি:

- **CPU Limits:** কন্টেইনারটি সর্বোচ্চ ১.৫ বা ২ কোর ব্যবহার করতে পারবে।
- **Memory Limits:** কন্টেইনারটি সর্বোচ্চ ৫১২MB র‍্যাম পাবে। লিমিট এক্সিড করলে ওএস কার্নেল প্রসেসটিকে **OOM (Out Of Memory) Killed** সিগন্যাল পাঠিয়ে বন্ধ করে দিবে।
- **I/O Bandwidth:** কন্টেইনারটি ডিস্কে সর্বোচ্চ কত স্পিডে রাইট করতে পারবে (যেমন: 50MB/s limit)।

---

### ৩. Union File System (UnionFS) & OverlayFS

ডকার ইমেজগুলো কীভাবে একাধিক লেয়ারে তৈরি হয় এবং কন্টেইনার রান করার পর মেমরি নষ্ট না করে ফাইল সিস্টেম রিড/রাইট করে, তার নেপথ্যে রয়েছে **UnionFS** (আধুনিক লিনাক্সে এর স্ট্যান্ডার্ড রূপ **Overlay2**)।

OverlayFS মূল ফাইল সিস্টেমকে ৩টি প্রধান লেয়ারে বিন্যস্ত করে:

1. **LowerDir (Read-Only Layer):** ডকার ইমেজের সমস্ত লেয়ারগুলো এখানে রিড-অনলি হিসেবে লক থাকে। এগুলোকে কখনই পরিবর্তন করা যায় না।
2. **UpperDir (Read-Write Container Layer):** কন্টেইনার যখন রান করে, ডকার কার্নেল তার মাথার ওপর একটি অত্যন্ত পাতলা রিড-রাইট লেয়ার বিছিয়ে দেয়। কন্টেইনারে যেকোনো নতুন ফাইল তৈরি বা রাইট করলে তা সরাসরি এই লেয়ারে গিয়ে জমা হয়।
3. **MergedDir (Unified View):** এটি হলো একটি ভার্চুয়াল মাউন্ট ভিউ। কন্টেইনারের ভেতরের অ্যাপ্লিকেশনটি যখন ফাইল ব্রাউজ করে, সে LowerDir এবং UpperDir-এর ফাইলগুলোকে একসাথে মার্জড অবস্থায় দেখতে পায়।

```mermaid
flowchart TD
    subgraph OverlayFS_Structure [OverlayFS: Layered File System Mechanics]
        Merged["Merged View <br>(What the Container Application Sees)"]

        Upper["Upper Directory <br>(Read-Write Layer - Container Lifetime Only)"]
        Work["WorkDir <br>(Used internally for atomicity)"]

        LowerN["Lower Directory N <br>(Read-Only Image Layer - e.g., Node App)"]
        Lower1["Lower Directory 1 <br>(Read-Only Base OS Layer - e.g., Alpine)"]

        Merged --> Upper
        Merged --> LowerN
        Merged --> Lower1

        Upper -.->|Overrides/Modifies| LowerN
    end

    style Merged fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Upper fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style LowerN fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
    style Lower1 fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff
```

#### Copy-on-Write (CoW) Mechanism

কন্টেইনার চলাকালীন যদি কোনো রিড-অনলি ইমেজের ফাইল (LowerDir) পরিবর্তন বা ডিলিট করতে হয়, কার্নেল সরাসরি তা করতে দেয় না। কার্নেল ব্যাকগ্রাউন্ডে নিচের নিয়মগুলো ফলো করে:

- **Modification (পরিবর্তন):** কার্নেল ফাইলটিকে LowerDir থেকে কপি করে UpperDir (Read-Write)-এ নিয়ে আসে এবং সেখানে পরিবর্তন করে। মার্জড ভিউতে এখন কন্টেইনার অ্যাপ্লিকেশনের কাছে নতুন ফাইলটি দৃশ্যমান হয়, কিন্তু মূল ইমেজ ফাইলে কোনো টাচ ঘটে না।
- **Deletion (মুছে ফেলা):** ফাইলটি ডিলিট করতে গেলে UpperDir-এ একটি বিশেষ **Whiteout file (চরিত্রহীন ফাইল বা ডামি ফাইল)** তৈরি করা হয়, যা মার্জড ভিউতে ফাইলটিকে লুকিয়ে রাখে।

> [!IMPORTANT]
> যেহেতু কন্টেইনারের সমস্ত রাইট অপারেশন `UpperDir` (Read-Write Layer)-এ ঘটে, তাই কন্টেইনার ডিলিট করে দিলে এই লেয়ারের সমস্ত ডেটা চিরতরে হারিয়ে যায়। এই জন্যই প্রডাকশন ডাটাবেসের ডেটা সবসময় ডকার **Volume**-এ রাখা বাধ্যতামূলক।

---

## ৩. Docker Engine Internal Architecture

অনেকেই মনে করেন ডকার নিজেই সরাসরি কন্টেইনার চালায়। এটি সম্পূর্ণ ভুল! ডকার আসলে একটি হাই-লেভেল কোঅর্ডিনেটর। কন্টেইনার স্পন করার জন্য ব্যাকএন্ডে একটি লুজলি কাপল্ড মাইক্রোসার্ভিস স্ট্যাক কাজ করে।

```mermaid
sequenceDiagram
    autonumber
    actor CLI as Docker CLI (docker run)
    participant Daemon as Docker Daemon (dockerd)
    participant Containerd as containerd
    participant Shim as containerd-shim
    participant Runc as runc (OCI Runtime)
    participant Kernel as Linux Kernel

    CLI->>Daemon: 1. POST /containers/create (REST API)
    Daemon->>Containerd: 2. Request to start container process
    Containerd->>Shim: 3. Spawn containerd-shim for container
    Shim->>Runc: 4. Invoke runc to build container
    Runc->>Kernel: 5. Syscalls: clone(), unshare(), setns() (namespaces & cgroups)
    Runc->>Shim: 6. Handover PID & Exit
    Shim->>Kernel: 7. Supervise container process (forward stdout/stderr & exit codes)
```

### Components of the Docker Engine:

#### ১. Docker CLI

ব্যবহারকারী যখন টার্মিনালে `docker run -d -p 80:80 nginx` কমান্ড দেন, CLI মূলত কমান্ডটিকে একটি স্ট্যান্ডার্ড JSON পে-লোডে কনভার্ট করে UNIX Socket বা TCP-এর মাধ্যমে ডকার ডেমোনের কাছে একটি **REST API Call** পাঠায়।

#### ২. Docker Daemon (`dockerd`)

এটি একটি ব্যাকগ্রাউন্ড সার্ভিস যা সবসময় চলতে থাকে। এর কাজ হলো ইমেজ ডাউনলোড/ম্যানেজ করা, ভলিউম তৈরি করা, নেটওয়ার্ক রাউটিং কনফিগার করা এবং সিকিউরিটি চেক করা। কিন্তু এটি সরাসরি কন্টেইনার প্রসেস হ্যান্ডেল করে না; কন্টেইনার ম্যানেজমেন্টের কাজ সে হস্তান্তর করে **containerd**-এর কাছে।

#### ৩. `containerd`

এটি একটি হাই-পারফরম্যান্স এবং ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কন্টেইনার লাইফসাইকেল ম্যানেজার (এটি CNCF-এর একটি গ্র্যাজুয়েটেড প্রজেক্ট)। এর কাজ হলো ইমেজের লেয়ারগুলো আনপ্যাক করে রানিং এনভায়রনমেন্ট তৈরি করা এবং কন্টেইনারের স্টেট মনিটর করা।

#### ৪. `containerd-shim`

সাধারণত কন্টেইনার চলাকালীন ডকার ডেমোন রিস্টার্ট দিলে বা ক্র্যাশ করলে সব রানিং কন্টেইনারও বন্ধ হয়ে যাওয়ার কথা। এই সমস্যা এড়াতে `containerd` প্রতিটা কন্টেইনারের জন্য একটি অত্যন্ত ছোট ডেমোন রান করায়, একে **containerd-shim** বলে।

- **সুবিধা:** শিম কন্টেইনারের স্ট্যান্ডার্ড ইনপুট/আউটপুট (stdout/stderr) এবং এক্সিট কোড ধরে রাখে। ডকার ডেমোন রিস্টার্ট নিলেও শিম কন্টেইনারগুলোকে জীবিত রাখে এবং ডেমোন ফিরে এলে ডেটা হ্যান্ডওভার করে।

#### ৫. `runc`

এটি ওপেন কন্টেইনার ইনিশিয়েটিভ (**OCI**) স্পেসিফিকেশন মেনে চলা একটি লো-লেভেল কন্টেইনার রানটাইম। এর একমাত্র কাজ হলো লিনাক্স কার্নেলের সাথে সরাসরি কথা বলে নেমস্পেস ও সিগ্রুপ তৈরি করা, কন্টেইনার প্রসেস স্টার্ট করা এবং সাথে সাথে নিজে মেমরি থেকে বের হয়ে যাওয়া (Exit)।

---

## ৪. Docker Images & Layering Mechanics

একটি ডকার ইমেজ মূলত কতগুলো রিড-অনলি ফাইল সিস্টেম লেয়ারের সমষ্টি। আমরা যখন `Dockerfile`-এ কোনো কমান্ড লিখি, প্রতিটি লাইনের জন্য ইমেজের একটি করে নতুন লেয়ার তৈরি হয়।

```dockerfile
# Dockerfile Example
FROM alpine:3.18      # Layer 1: Base Alpine OS (approx 5MB)
RUN apk add --no-cache nodejs npm # Layer 2: Install Node.js (approx 40MB)
WORKDIR /app          # Layer 3: Metadata change
COPY . .              # Layer 4: Copy source code (approx 10MB)
RUN npm install       # Layer 5: Install dependencies (approx 150MB)
CMD ["node", "server.js"]
```

### Build Cache & Invalidation Rules

ডকার ইমেজের বিল্ড টাইম দ্রুত করার জন্য প্রতিটি লেয়ার ক্যাশ করে রাখে। যখন আমরা পরবর্তীতে ইমেজ বিল্ড করি, ডকার চেক করে `Dockerfile`-এর ইন্সট্রাকশন এবং সোর্স ফাইলে কোনো পরিবর্তন এসেছে কিনা।

- **Cache Hit:** কোনো লাইনে পরিবর্তন না থাকলে ডকার ক্যাশ লেয়ারটি সরাসরি ব্যবহার করে।
- **Cache Invalidation:** যদি কোনো নির্দিষ্ট লাইনে (যেমন `COPY . .`) পরিবর্তন পাওয়া যায়, তবে ডকার সেই লাইনের ক্যাশ ভেঙে দেয় এবং **তার পর থেকে থাকা সমস্ত ক্যাশ বাতিল হয়ে নতুন করে বিল্ড হয়।**

> [!TIP]
> **Optimizing Dependency Installation:** আপনার কোড ফাইলে প্রতিবার একটি ছোট লাইন এডিট করলেই যেন ডকারকে সম্পূর্ণ `npm install` বা `pip install` করতে না হয়, তার জন্য প্যাকেজ ফাইলগুলো আগে কপি করে ডিপেন্ডেন্সি ইনস্টল করে নিন।
>
> ```dockerfile
> # ✅ Best Practice: Order matters!
> COPY package.json package-lock.json ./
> RUN npm install
> COPY . .
> ```

---

### Multistage Build Optimization (ইমেজ সাইজ অপ্টিমাইজেশন)

রিয়েক্ট, গো বা জাভা অ্যাপ্লিকেশনের ক্ষেত্রে আমাদের বিল্ড জেনারেট করার জন্য হেভি ডিপেন্ডেন্সি (যেমন Webpack, Go Compiler) প্রয়োজন হয়। কিন্তু প্রোডাকশন রানটাইমে শুধু বিল্ড ফাইলটি (`dist/` বা `binary`) হলেই চলে।

যদি আমরা এক স্টেজে ডকার ইমেজ বানাই, তবে কম্পাইলার ও অতিরিক্ত টুলস সহ ইমেজ সাইজ ১ গিগাবাইট ছাড়িয়ে যেতে পারে, যা ক্লাউডে ডিপ্লয় করতে অনেক সময় নেয় এবং সিকিউরিটি রিস্ক বাড়ায়। এর সমাধান হলো **Multistage Build**।

```dockerfile
# Stage 1: Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # Generates optimized HTML/JS inside /app/dist

# Stage 2: Production Stage (Extremely Minimal)
FROM nginx:alpine
# Copy only the compiled dist files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

> [!NOTE]
> মাল্টি-স্টেজ বিল্ড ব্যবহারের ফলে রিয়েক্ট প্রজেক্টের ইমেজ সাইজ প্রায় **১.২GB থেকে কমে মাত্র ২২MB**-তে নেমে আসে, যা নেটওয়ার্ক ব্যান্ডউইথ এবং ক্লাউড হোস্টিং খরচ নাটকীয়ভাবে হ্রাস করে।

---

## ৫. Docker Networking Internals

কন্টেইনারগুলোর আইসোলেটেড নেটওয়ার্ক নেমস্পেস থাকা সত্ত্বেও তারা কীভাবে ইন্টারনেটের সাথে এবং একে অপরের সাথে পোর্ট বাইন্ডিং ও আইপি রাউটিংয়ের মাধ্যমে কথা বলে?

```mermaid
flowchart LR
    subgraph ContainerA [Container A Namespace]
        vethA[veth0-a]
    end

    subgraph ContainerB [Container B Namespace]
        vethB[veth0-b]
    end

    subgraph HostNamespace [Host OS Network Namespace]
        Bridge["docker0 Bridge <br>(Virtual Switch - 172.17.0.1)"]
        vethA_Host[vethA-host]
        vethB_Host[vethB-host]

        IPTables["IP Tables <br>(NAT & Port Forwarding)"]
        NIC[Physical NIC - eth0]
    end

    vethA <-->|Virtual Cable| vethA_Host
    vethB <-->|Virtual Cable| vethB_Host

    vethA_Host <--> Bridge
    vethB_Host <--> Bridge

    Bridge <--> IPTables
    IPTables <--> NIC

    style Bridge fill:#065f46,stroke:#10b981,color:#fff
    style IPTables fill:#7c2d12,stroke:#f97316,color:#fff
```

### How the Bridge Network Works Under the Hood:

1. **The virtual switch (`docker0`):** ডকার যখন বুট আপ হয়, হোস্ট ওএসে একটি ভার্চুয়াল নেটওয়ার্ক ব্রিজ বা লজিক্যাল সুইচ তৈরি করা হয় যার নাম **`docker0`** (আইপি সাধারণত `172.17.0.1/16`)।
2. **Virtual Ethernet Pairs (`veth`):** যখনই একটি কন্টেইনার রান করানো হয়, ডকার কার্নেলে এক জোড়া ভার্চুয়াল নেটওয়ার্ক কেবল তৈরি করে যাকে **`veth` pair** বলা হয়।
   - কেবলের এক মাথা কন্টেইনারের ভেতরে ঢুকে ভার্চুয়াল নিক (`eth0`) হিসেবে কাজ করে।
   - অন্য মাথাটি হোস্ট ওএসের গ্লোবাল নেটওয়ার্ক স্পেসের **`docker0`** ব্রিজের সাথে ফিজিক্যালি প্লাগড বা কানেক্টেড করে দেওয়া হয়।
3. **Internal IP Assignment:** ব্রিজটি কন্টেইনারকে একটি ইউনিক ইন্টারনাল আইপি (যেমন: `172.17.0.2`) অ্যাসাইন করে। এর ফলে একই ব্রিজে থাকা দুটি কন্টেইনার সরাসরি একে অপরের আইপি ব্যবহার করে পিং করতে পারে।
4. **Outbound Internet (NAT):** কন্টেইনার যখন ইন্টারনেটে রিকোয়েস্ট পাঠায়, লিনাক্স কার্নেলের **iptables** এবং **NAT (Network Address Translation)** ব্যবহার করে কন্টেইনারের আইপিটিকে হোস্ট ওএসের রিয়েল পাবলিক আইপিতে রূপান্তর করে প্যাকেটটি বাইরে পাঠিয়ে দেয়।
5. **Inbound Traffic (Port Forwarding):** আমরা যখন `-p 8080:80` ফ্ল্যাগ দিই, ডকার হোস্টের `iptables`-এ একটি রুলস অ্যাড করে দেয়: _"হোস্টের ৮০৮০ পোর্টে কোনো প্যাকেট এলে তা সরাসরি লুপব্যাক করে কন্টেইনারের ৮০ নম্বর পোর্টে রিডাইরেক্ট করে দাও।"_

---

### Docker Network Drivers Comparison

| Driver      |                                                               Mechanics & Behavior                                                                | Best Use Case                                                       |
| :---------- | :-----------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------ |
| **Bridge**  |           এটি ডকারের ডিফল্ট ড্রাইভার। হোস্টের ভেতরে একটি প্রাইভেট লজিক্যাল নেটওয়ার্ক তৈরি করে প্রসেসগুলোকে ভার্চুয়াল সুইচে প্লাগ করে।           | স্ট্যান্ডঅ্যালোন কন্টেইনার ও সিম্পল লোকাল টেস্টিং।                  |
| **Host**    | কন্টেইনারের নেটওয়ার্ক নেমস্পেস সম্পূর্ণরূপে ওপেন করে হোস্টের সাথে মিশিয়ে দেয়। কন্টেইনারের আলাদা কোনো আইপি থাকে না, সরাসরি হোস্টের পোর্ট দখল করে। | হাই-থ্রুপুট নেটওয়ার্ক পারফরম্যান্স (যেমন: Reverse Proxy, Nginx)।   |
| **None**    |           কন্টেইনারের নেটওয়ার্কিং ডিভাইস সম্পূর্ণ নিষ্ক্রিয় করে দেয়। লুপব্যাক ডিভাইস (`127.0.0.1`) ছাড়া আর কোনো কানেক্টিভিটি থাকে না।            | অতি-সংবেদনশীল সিকিউর ডাটা প্রসেসিং, ব্যাচ জব ও ক্যাওস টেস্টিং।      |
| **Overlay** |         মাল্টিপল ফিজিক্যাল সার্ভারের ডকার ডেমোনগুলোকে কানেক্ট করে একটি ভার্চুয়াল VXLAN টানেল বা ডিস্ট্রিবিউটেড ওভারলে নেটওয়ার্ক তৈরি করে।         | **Docker Swarm** বা মাল্টি-হোস্ট মাইক্রোসার্ভিস ক্লাস্টার।          |
| **Macvlan** |     কন্টেইনারকে সরাসরি হোস্টের ফিজিক্যাল নেটওয়ার্ক কার্ডের মেক অ্যাড্রেস (MAC) এবং আইপি সরাসরি অ্যাসাইন করে দেয়, কোনো ভার্চুয়াল ব্রিজ ছাড়াই।     | লিগ্যাসি নেটওয়ার্ক মনিটরিং টুলস এবং এন্টারপ্রাইজ নেটওয়ার্ক ডোমেন। |

---

## ৬. Docker Storage & Volumes Internals

কন্টেইনারের ফাইলসিস্টেমের লাইফসাইকেল অত্যন্ত টেম্পোরারি বা ক্ষণস্থায়ী। কন্টেইনার ডিলিট হলে তার রিড-রাইট লেয়ারে থাকা ডেটাও হারিয়ে যায়। এই সমস্যা দূর করতে ডকার ৩টি আলাদা স্টোরেজ মেকানিজম প্রদান করে:

```mermaid
flowchart TD
    subgraph StorageMechanics [Docker Storage Solutions]
        VMount["1. Named Volumes <br>(Managed by Docker - /var/lib/docker/volumes/)"]
        BMount["2. Bind Mounts <br>(Direct Host Path - e.g., /mnt/data)"]
        Tmpfs["3. Tmpfs Mounts <br>(In-Memory Only - Never written to disk)"]
    end
```

### ১. Named Volumes (ডিফল্ট প্রডাকশন স্ট্যান্ডার্ড)

ভলিউম হলো ডকার দ্বারা সম্পূর্ণ নিয়ন্ত্রিত হোস্ট ওএসের একটি ডেডিকেটেড ডিরেক্টরি (লিনাক্সে সাধারণত `/var/lib/docker/volumes/` পাথে থাকে)।

- **মেকানিজম:** ভলিউমগুলো কন্টেইনারের রিড-রাইট বা OverlayFS লেয়ারকে বাইপাস করে সরাসরি হোস্টের ড্রাইভের সাথে কনেক্টেড থাকে। এর ফলে কন্টেইনারে ডেটা রিড-রাইট করার সময় কোনো Copy-on-Write ওভারহেড থাকে না, যা ফিজিক্যাল ডিস্ক স্পিড দেয়।
- **সুবিধা:** সম্পূর্ণ ডকার CLI দিয়ে ম্যানেজ করা যায়, ব্যাকআপ নেওয়া সহজ এবং একাধিক কন্টেইনার একই ভলিউম একই সাথে শেয়ার করতে পারে।

### ২. Bind Mounts

এটি হোস্ট মেশিনের যেকোনো কাস্টম ডিরেক্টরি বা ফাইলকে (যেমন `/home/user/project`) কন্টেইনারের ভেতরের নির্দিষ্ট পাথে সরাসরি মাউন্ট করে দেয়।

- **মেকানিজম:** এটি লিনাক্সের স্ট্যান্ডার্ড `mount --bind` সিস্টেম কল ব্যবহার করে হোস্টের রিয়েল ফাইলসিস্টেম নোড কন্টেইনারের নেমস্পেসে পুশ করে দেয়।
- **সুবিধা:** লোকাল ডেভেলপমেন্টের সময় কোড পরিবর্তন করলে সাথে সাথে কন্টেইনারের ভেতরে তা রিফ্লেক্ট হওয়ার জন্য এটি অত্যন্ত সুবিধাজনক। তবে প্রডাকশনে এটি ব্যবহার না করাই শ্রেয়, কারণ এটি হোস্টের ফাইল ডিরেক্টরির ওপর অতিরিক্ত ডিপেন্ডেন্সি তৈরি করে।

### ৩. Tmpfs Mount

এটি ফাইল সিস্টেমে কোনো ফাইল না লিখে সরাসরি হোস্টের **RAM**-এর একটি অংশে মেমরি-ম্যাপ করে ডেটা স্টোর করে।

- **সুবিধা:** এটি অত্যন্ত ফাস্ট কারণ মেমরিতে ডেটা থাকে। কন্টেইনার বন্ধ হয়ে গেলে ডেটা মুছে যায়। সিক্রেট ফাইল বা সংবেদনশীল টেম্পোরারি কি-ভ্যালু ক্যাশিংয়ের জন্য এটি উপযোগী।

---

## ৭. Production & Security Internals

কন্টেইনারাইজড অ্যাপ্লিকেশন ডিপ্লয় করার সময় সিকিউরিটি গাফিলতি ও কার্নেল টিউনিংয়ের অভাব ব্যাকএন্ড সিস্টেমের বড় ধরণের বিপর্যয় ঘটাতে পারে। নিচে সিনিয়র আর্কিটেক্টদের কয়েকটি অতি-গুরুত্বপূর্ণ প্রোডাকশন মেকানিজম তুলে ধরা হলো:

### ১. The Root User Trap (সিকিউরিটি থ্রেট)

ডিফল্ট অবস্থায় ডকার ফাইল কনফিগার না করলে কন্টেইনারের ভেতরের সব অ্যাপ্লিকেশন হোস্ট ওএসের `root` ইউজারের পাওয়ার নিয়ে রান করে। এর ফলে যদি অ্যাপ্লিকেশনে কোনো রিমোট কোড এক্সিকিউশন (RCE) বাগ থাকে, হ্যাকার সহজেই কন্টেইনারের সীমানা ভেঙে হোস্ট ওএসের রুট এক্সেস নিয়ে নিতে পারে (**Container Breakout**)।

> [!CAUTION]
> **Production Rule:** কখনই কন্টেইনারকে root হিসেবে চালাবেন না। ডকার ফাইলে অবশ্যই একটি ডেডিকেটেড নন-প্রিভিলেজড ইউজার তৈরি করে নেবেন।

```dockerfile
# ✅ Best Practice: Config Non-Root User
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Create a system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Change ownership of app directory
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
```

---

### ২. SIGTERM vs. SIGKILL (Graceful Shutdown)

আমরা যখন `docker stop` কমান্ড দিই, ডকার ডেমোন কন্টেইনারের **PID 1 (প্রধান প্রসেস)**-কে একটি **`SIGTERM`** সিগন্যাল পাঠায়। অ্যাপ্লিকেশনকে ভদ্রভাবে বন্ধ হতে, ওপেন ডাটাবেস কানেকশন রিলিজ করতে এবং কারেন্ট রিকোয়েস্ট শেষ করার জন্য ডকার ডিফল্ট ১০ সেকেন্ড গ্রেস টাইম দেয়। অ্যাপ্লিকেশন ১০ সেকেন্ডের মধ্যে রেসপন্স না করলে ডকার ফোর্স কিল করতে **`SIGKILL`** সিগন্যাল ট্রিগার করে।

#### The Exec vs. Shell Form Pitfall:

অনেক ডেভেলপার Dockerfile-এর শেষে রান কমান্ড এভাবে লেখেন:

```dockerfile
# ❌ Shell Form: runs as /bin/sh -c "node server.js"
CMD node server.js
```

এর ফলে লিনাক্স কার্নেল আমাদের নোড প্রসেসটিকে PID 1 হিসেবে রান না করিয়ে `/bin/sh`-কে PID 1 হিসেবে রান করায়। শেল প্রসেসটি কোনো সিগন্যাল নোড প্রসেসে ফরওয়ার্ড করে না। ফলে ডকার ডেমোন যখন `SIGTERM` পাঠায়, অ্যাপ্লিকেশন তা জানতেই পারে না এবং ১০ সেকেন্ড অলস বসে থাকার পর অবধারিতভাবে `SIGKILL` (Exit Code 137) দিয়ে ক্র্যাশ করে।

```dockerfile
# ✅ Exec Form: Runs directly as PID 1
CMD ["node", "server.js"]
```

Exec Form ব্যবহার করলে অ্যাপ্লিকেশন সরাসরি `SIGTERM` হ্যান্ডেল করতে পারে এবং গ্রেসফুল শাটডাউন সম্ভব হয়।

---

### ৩. CPU & Memory Resource Limits (Denial of Service Prevention)

প্রোডাকশনে কন্টেইনারের রিসোর্স লিমিট না করে রাখলে যদি কোনো মেমরি লিক বা ইনফিনিট লুপ বাগ ঘটে, একটি কন্টেইনার হোস্টের সম্পূর্ণ র‍্যাম গ্রাস করে পুরো ডকার ডেমোনকে স্তব্ধ করে দিতে পারে।

ডকার কম্পোজ ফাইলে সবসময় রিসোর্স কনস্ট্রেইন্ট ডিফাইন করা আবশ্যক:

```yaml
version: '3.8'
services:
  web-app:
    image: my-node-app:v1
    deploy:
      resources:
        limits:
          cpus: '0.50' # সর্বোচ্চ ৫০% CPU কোর ব্যবহার করতে পারবে
          memory: 512M # সর্বোচ্চ ৫১২MB র‍্যামের বেশি পাবে না
        reservations:
          cpus: '0.25' # নূন্যতম ২৫% CPU গ্যারান্টিড পাবে
          memory: 256M # নূন্যতম ২৫৬MB র‍্যাম রিজার্ভ থাকবে
```

---

## ৮. Linux cgroups v1 vs. cgroups v2: The Modern Transition

কন্টেইনারের রিসোর্স লিমিট করার জন্য আমরা `cgroups` ব্যবহার করি। তবে সাম্প্রতিক বছরগুলোতে লিনাক্স কার্নেলে সিগ্রুপের আর্কিটেকচারে একটি বিশাল বৈপ্লবিক পরিবর্তন এসেছে—**cgroups v1** থেকে **cgroups v2**-তে রূপান্তর (লিনাক্স কার্নেল ৪.৫+ এবং ২০২০ সালের পর থেকে আধুনিক ডিস্ট্রিবিউশনগুলোতে এটি ডিফল্ট)।

```mermaid
flowchart TD
    subgraph cgroups_v1 [cgroups v1: Multiple Separate Hierarchies]
        direction TB
        Proc1_v1[Process A]
        Proc2_v1[Process B]

        CPU_Tree["CPU Controller Tree"]
        Mem_Tree["Memory Controller Tree"]
        IO_Tree["BlkIO Controller Tree"]

        Proc1_v1 --> CPU_Tree
        Proc1_v1 --> Mem_Tree
        Proc2_v1 --> Mem_Tree
        Proc2_v1 --> IO_Tree
    end

    subgraph cgroups_v2 [cgroups v2: Single Unified Hierarchy]
        direction TB
        Proc1_v2[Process A]
        Proc2_v2[Process B]

        UnifiedTree["Unified Controller Tree <br>(CPU, Memory, I/O, PIDs)"]

        Proc1_v2 --> UnifiedTree
        Proc2_v2 --> UnifiedTree
    end

    style CPU_Tree fill:#7c2d12,stroke:#f97316,color:#fff
    style Mem_Tree fill:#7c2d12,stroke:#f97316,color:#fff
    style UnifiedTree fill:#065f46,stroke:#10b981,color:#fff
```

### cgroups v1-এর সীমাবদ্ধতা:

v1 আর্কিটেকচারে প্রতিটা রিসোর্সের (CPU, Memory, Disk IO) জন্য আলাদা আলাদা কন্ট্রোলার এবং সম্পূর্ণ পৃথক ডিরেক্টরি ট্রি বা হায়ারার্কি থাকত।

- **সমস্যা:** একটি প্রসেস সিপিইউ হায়ারার্কির এক জায়গায় এবং মেমরি হায়ারার্কির সম্পূর্ণ ভিন্ন জায়গায় থাকতে পারত। এর ফলে কন্ট্রোলারগুলোর মধ্যে সিঙ্ক করা অসম্ভব ছিল। উদাহরণস্বরূপ, ডিস্ক রাইট থ্রোটলিং (I/O limits) করার সময় মেমরি পেজ ক্যাশ বাফারের সাথে ট্র্যাকিং মিলত না, যার ফলে কার্নেল লেভেলে ডেডলক ও পারফরম্যান্স ড্রপ হতো।

### cgroups v2-এর আধুনিক সুবিধা:

v2-তে সমস্ত রিসোর্সকে একটি **Single Unified Hierarchy** বা একক গাছের অধীনে নিয়ে আসা হয়েছে। একটি প্রসেস গাছের কেবল একটি নোডেই থাকতে পারে।

1. **Unified Resource Control:** এখন সিপিইউ, মেমরি এবং আইও কন্ট্রোলার একসাথে একই প্রসেস বাউন্ডারিতে কাজ করে। ফলে ডকার নিখুঁতভাবে I/O এবং Memory Writeback ট্র্যাকিং করতে পারে।
2. **Pressure Stall Information (PSI):** এটি v2-এর একটি চমৎকার ফিচার। এটি কার্নেল লেভেলে ট্র্যাক করে প্রসেসটি সিপিইউ, মেমরি বা আইও-এর সংকটের কারণে ঠিক কত মিলি-সেকেন্ড অলস বসে (Starve) ছিল। এর মাধ্যমে সিস্টেম OOM ক্র্যাশে যাওয়ার আগেই সতর্কতা সংকেত দেয়।
3. **Rootless Containers Support:** cgroups v2 লিনাক্সের সাধারণ নন-রুট ইউজারদের সেফলি রিসোর্স লিমিট করার পারমিশন দেয়, যা **Rootless Docker** ও কন্টেইনার সিকিউরিটি উন্নয়নে বড় অবদান রাখছে।

---

## ৯. Container Hardening: Seccomp, AppArmor, & Linux Capabilities

অনেকেই মনে করেন কন্টেইনারে `root` ইউজার হিসেবে কোড রান করলে হোস্টের রুটের মতোই সমান পাওয়ার পাওয়া যায়। কিন্তু লিনাক্স কার্নেল ও ডকার ইঞ্জিনের ডিফেন্স-ইন-ডেপথ সিকিউরিটির জন্য এটি সত্য নয়। কার্নেল মূলত ৩টি লেয়ারে কন্টেইনারকে লক করে রাখে:

```mermaid
flowchart TD
    subgraph HardeningLayers [Docker Kernel Security Hardening]
        Syscall[Container System Call]

        Cap["1. Linux Capabilities <br>(libcap - Dropped by default)"]
        Seccomp["2. Seccomp Profile <br>(Syscall Filtering - 300+ blocked)"]
        LSM["3. AppArmor / SELinux <br>(Mandatory Access Control)"]

        HostKernel["Host Linux Kernel - Ring 0"]

        Syscall --> Cap
        Cap --> Seccomp
        Seccomp --> LSM
        LSM --> HostKernel
    end

    style Cap fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Seccomp fill:#7c2d12,stroke:#f97316,color:#fff
    style LSM fill:#065f46,stroke:#10b981,color:#fff
```

### ১. Linux Capabilities (লিপক্যাপ)

ঐতিহ্যগতভাবে লিনাক্সে সিকিউরিটি বাইনারি ছিল: হয় আপনি সাধারণ ইউজার (সব ব্লকড) অথবা আপনি রুট ইউজার (সব পারমিটেড)। আধুনিক লিনাক্সে রুটের এই বিশাল ক্ষমতাকে প্রায় ৪০টি ছোট ছোট সূক্ষ্ম ক্ষমতায় ভাগ করা হয়েছে, যাকে **Capabilities** বলা হয়।

- **Default Dropping:** ডকার কন্টেইনারের ভেতরের প্রসেসটি রুট হলেও, হোস্ট সুরক্ষার জন্য ডকার ডিফল্ট অবস্থায় বেশিরভাগ শক্তিশালী ক্যাপাবিলিটি কেড়ে নেয়। সে কেবল `CAP_CHOWN`, `CAP_SETUID` এবং `CAP_NET_BIND_SERVICE` (১০২৪-এর নিচের পোর্ট ওপেন করার ক্ষমতা) এর মতো গুটিয়েক বেসিক পাওয়ার রেখে বাকি সব ফেলে দেয়।
- **Custom Config:** আপনি যদি কন্টেইনারকে সিস্টেমের ঘড়ি পরিবর্তন করার ক্ষমতা দিতে চান (`CAP_SYS_TIME`) বা নেটওয়ার্ক কার্ড মডিফাই করতে চান (`CAP_NET_ADMIN`), তবে রান করার সময় স্পেসিফিক ক্যাপাবিলিটি অ্যাড বা ড্রপ করতে পারেন:
  ```bash
  # ক্যাপাবিলিটি ড্রপ ও অ্যাড করার নিয়ম
  docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
  ```

---

### ২. Seccomp (Secure Computing Mode)

সেকম্প হলো লিনাক্স কার্নেলের একটি সিস্টেম কল ফিল্টারিং মেকানিজম। লিনাক্স কার্নেলে ৩০০-এর বেশি সিস্টেম কল (Syscalls) রয়েছে। ডকার একটি ডিফল্ট JSON সেকম্প প্রোফাইল ব্যবহার করে যার মাধ্যমে কন্টেইনারের ভেতরের প্রসেসের জন্য প্রায় ৪৪টি বিপজ্জনক সিস্টেম কল সম্পূর্ণ ব্লক করে দেওয়া হয়।

- **Blocked Syscalls:** উদাহরণস্বরূপ, কন্টেইনারের ভেতর থেকে ওএস রিবুট করা (`reboot`), নতুন ফাইলসিস্টেম মাউন্ট করা (`mount`), বা কার্নেল মডিউল লোড করা (`init_module`) সিস্টেম কলগুলো সেকম্প প্রোফাইল সরাসরি আটকে দেয়। এর ফলে হ্যাকার কন্টেইনার হ্যাক করলেও ওএস ডাউন করতে পারে না।

---

### ৩. AppArmor / SELinux

এটি হলো **Mandatory Access Control (MAC)** পলিসি। এটি ওএস লেভেলে একটি প্রসেসের ফাইল পাথ অ্যাক্সেস করার ক্ষমতা সীমিত করে।

- ডকার রান করার সময় হোস্ট ওএসে অটোমেটিক একটি `docker-default` অ্যাপ-আর্মর প্রোফাইল লোড করে। এর ফলে কন্টেইনারের কোনো প্রসেস হোস্টের স্পর্শকাতর ফাইল (যেমন `/sys`, `/proc` বা `/etc/shadow`) রিড বা রাইট করতে চেষ্টা করলে কার্নেল সাথে সাথে তা রিজেক্ট করে দেয়।

---

## ১০. Zombie Processes & Container Init Systems (Tini / PID 1 Reap)

লিনাক্স অপারেটিং সিস্টেমে প্রতিটা প্রসেস যখন তার কাজ শেষ করে চলে যায়, ওএস কার্নেল সাথে সাথে তার পুরো ডেটা মেমরি থেকে মুছে দেয় না। কার্নেল প্রসেস টেবিলে তার এক্সিট কোড ও এন্ট্রি রেখে দেয় যতক্ষণ না তার অভিভাবক বা প্যারেন্ট প্রসেস এসে `wait()` বা `waitpid()` সিস্টেম কল করে সেই ডেটা রিড করে। এই সংক্ষিপ্ত সময়ের জন্য প্রসেসটি মৃত কিন্তু টেবিলে দৃশ্যমান অবস্থায় থাকে, একে **Zombie (defunct) Process** বলে।

```mermaid
sequenceDiagram
    autonumber
    participant Parent as Parent App (PID 1 - e.g. Node.js)
    participant Child as Spawned Worker Process
    participant Kernel as Linux Kernel / Process Table

    Parent->>Child: 1. Spawn Worker Process
    Note over Child: Worker completes task
    Child->>Kernel: 2. exit(0) / Syscall terminate
    Note over Kernel: Child becomes ZOMBIE (defunct)
    Note over Parent: Case A: Normal App doesn't call waitpid()
    Kernel-->>Parent: Zombie remains in Process Table forever
    Note over Parent: Case B: Using Init System (Tini - PID 1)
    Parent->>Kernel: 3. waitpid() / Reaps zombie entry
    Kernel->>Kernel: 4. Clear process table entry completely
```

### PID 1-এর দায়িত্ব:

লিনাক্স ওএসের প্রথম প্রসেস বা **PID 1 (Init System - যেমন systemd)** এর প্রধান দায়িত্ব হলো সিস্টেমে কোনো অভিভাবকহীন অনাথ (Orphaned) প্রসেস তৈরি হলে নিজে তার প্যারেন্ট হয়ে যাওয়া এবং তারা মারা গেলে তাদের এক্সিট স্টেট রিড করে প্রসেস টেবিল থেকে মুছে ফেলা (Zombie Reaping)।

### কন্টেইনারের সমস্যা:

আমরা যখন কন্টেইনারে আমাদের নোড বা জাভা অ্যাপ্লিকেশন রান করাই, তখন আমাদের অ্যাপ্লিকেশন প্রসেসটিই কন্টেইনারের **PID 1** হয়ে বসে।

- **সমস্যা:** আমাদের অ্যাপ্লিকেশনগুলো কিন্তু সিস্টেম ইনিট সফটওয়্যার নয়। এরা প্যারেন্ট প্রসেস হিসেবে সাব-প্রসেসগুলোর জম্বি স্টেট ক্লিয়ার করার জন্য ডিজাইন করা হয়নি।
- এর ফলে কন্টেইনারের ভেতর যদি মাল্টিপল চাইল্ড প্রসেস বা শেল স্ক্রিপ্ট রান করানো হয়, তারা কাজ শেষে মারা গেলেও জম্বি প্রসেস হিসেবে প্রসেস টেবিলে জমে থাকে। ধীরে ধীরে প্রসেস টেবিল ফুল হয়ে যায় এবং ওএস নতুন কোনো প্রসেস স্পন করতে পারে না (Process Table Exhaustion)।

### সমাধান: `--init` ফ্ল্যাগ বা Tini

ডকার এই সমস্যা সমাধানের জন্য **Tini** নামের একটি অতি ক্ষুদ্র ইনিট সিস্টেম বিল্ট-ইন দেয়।

- **ব্যবহার:** কন্টেইনার রান করার সময় `--init` ফ্ল্যাগ দিলে ডকার `tini`-কে PID 1 হিসেবে রান করায় এবং আমাদের অ্যাপ্লিকেশনটিকে তার চাইল্ড হিসেবে স্পন করে।
  ```bash
  docker run -d --init my-node-app
  ```
  `tini` তখন নিখুঁতভাবে সিগন্যাল ফরওয়ার্ডিং (SIGTERM) হ্যান্ডেল করে এবং সমস্ত জম্বি প্রসেস তৈরি হওয়ামাত্র ওএস কার্নেল থেকে রিড করে সাফ করে দেয়।

---

## ১১. Docker Multi-Architecture Builds: Buildx & QEMU Internals

আজকের ক্লাউড ইনফ্রাস্ট্রাকচারে আর্কিটেকচারের বৈচিত্র্য অনেক। আমরা হয়তো লোকাল উইন্ডোজ/ম্যাক কম্পিউটারে রান করি **ARM64** বা **AMD64 (x86_64)** আর্কিটেকচারে, আর ক্লাউড সার্ভারগুলো (যেমন AWS Graviton বা Intel Xeon) রান করে ভিন্ন আর্কিটেকচারে।

ভিন্ন CPU আর্কিটেকচারের জন্য একই অ্যাপ্লিকেশনের ইমেজ জেনারেশন ডকার কীভাবে হ্যান্ডেল করে?

```mermaid
flowchart TD
    subgraph BuildxEngine [Docker Buildx & Multi-Arch Architecture]
        Buildx["docker buildx build"]

        subgraph Platforms [Target Platforms]
            P_AMD["linux/amd64"]
            P_ARM["linux/arm64"]
        end

        QEMU["QEMU Emulation <br>(Translates CPU instructions in real-time)"]

        Manifest["Docker Registry Manifest List <br>(Unified Reference - 'my-app:v1')"]

        Buildx --> Platforms
        Platforms -->|Compiling on host| QEMU
        Platforms -->|Publish| Manifest
    end

    style Buildx fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style QEMU fill:#7c2d12,stroke:#f97316,color:#fff
    style Manifest fill:#065f46,stroke:#10b981,color:#fff
```

### ১. Docker Buildx & BuildKit:

ডকারের আধুনিক বিল্ড ইঞ্জিন **BuildKit** এবং এর এক্সটেনশন CLI **Buildx** মাল্টি-আর্কিটেকচার ইমেজ তৈরির মূল কারিগর। এটি একই সাথে প্যারালালি একাধিক প্ল্যাটফর্মের জন্য বিল্ড চালাতে পারে।

### ২. QEMU Emulation Internals:

আমরা যখন আমাদের AMD64 ল্যাপটপে বসে ARM64 ইমেজ বিল্ড করার কমান্ড দিই:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t my-app:v1 --push .
```

হোস্ট ওএসের কার্নেলের **binfmt_misc** ফিচার ব্যবহার করে ডকার ব্যাকগ্রাউন্ডে একটি **QEMU Emulation Layer** চালু করে।

- **QEMU** মূলত রিয়েল-টাইমে প্রসেসরের ARM ইন্সট্রাকশনগুলোকে AMD64 ইন্সট্রাকশনে কনভার্ট করে রান করায়। এটি কিছুটা ধীরগতির হলেও চমৎকারভাবে ভিন্ন আর্কিটেকচারের ইমেজ কম্পাইল করতে পারে।

### ৩. Manifest Lists (মাল্টি-আর্কিটেকচার মেনিফেস্ট):

বিল্ড শেষে ডকার রেজিস্ট্রি বা হাব-এ একটি চমৎকার ইনডেক্স ফাইল আপলোড করে, একে **Manifest List** বলে।

- আপনি যখন ডকার হাব থেকে `nginx` ইমেজটি পুল (`docker pull nginx`) করেন, ডকার হাব দেখে আপনার লোকাল সিপিইউ কোন আর্কিটেকচারের। সে অনুযায়ী মেনিফেস্ট লিস্ট থেকে রিডাইরেক্ট করে শুধুমাত্র আপনার সিপিইউ-এর জন্য উপযোগী স্পেসিফিক ইমেজ লেয়ারটি ডাউনলোড করে দেয়।

---

## ১২. Docker Logging Engines & Ring Buffer Internals

কন্টেইনারের ভেতরের প্রসেস যখন স্ট্যান্ডার্ড আউটপুট (`stdout`) বা এরর (`stderr`)-এ ডেটা লেখে, ডকার ইঞ্জিন কীভাবে তা সংগ্রহ করে আমাদের `docker logs` কমান্ডে রিয়েল-টাইমে শো করায়?

```mermaid
flowchart TD
    subgraph LoggingArchitecture [Docker Daemon Log Delivery Pipelines]
        App[Container App Write] -->|stdout / stderr| FIFO[UNIX Pipes / FIFO Buffers]
        FIFO --> Daemon[Docker Daemon - dockerd]

        subgraph Drivers [Docker Logging Drivers]
            JSON["1. json-file <br>(Default - Disk Space Exhaustion Risk)"]
            Local["2. local <br>(Optimized Local Engine)"]
            Syslog["3. syslog / journald <br>(OS Native Collector)"]
            Fluent["4. fluentd / splunk <br>(Enterprise Centralized Logs)"]
        end

        Daemon --> Drivers
    end

    style FIFO fill:#7c2d12,stroke:#f97316,color:#fff
    style Drivers fill:#065f46,stroke:#10b981,color:#fff
```

### লগ ডেলিভারি মেকানিজম:

1. **FIFO Buffers:** ডকার কন্টেইনার প্রসেসটিকে সরাসরি হোস্ট ওএসের টার্মিনাল সকেটের সাথে কানেক্ট না করে তার stdout/stderr পাইপগুলোকে কার্নেল লেভেলের **FIFO/Named Pipes** বাফারের সাথে কানেক্ট করে দেয়।
2. **dockerd Interception:** ডকার ডেমোন ব্যাকগ্রাউন্ডে এই পাইপগুলো থেকে অনবরত ডেটা রিড করে এবং কনফিগার করা **Logging Driver**-এর কাছে হস্তান্তর করে।

---

### The json-file Driver & Disk Space Exhaustion (একটি পরিচিত বিপর্যয়)

ডিফল্ট অবস্থায় ডকার **`json-file`** ড্রাইভার ব্যবহার করে। এটি প্রতিটা কন্টেইনারের সমস্ত লগ হোস্টের `/var/lib/docker/containers/<id>/<id>-json.log` পাথে সাধারণ JSON ফাইল হিসেবে সেভ করে।

- **বিপর্যয়:** এই ফাইলটির কোনো ডিফল্ট সাইজ লিমিট নেই! কন্টেইনারে প্রচুর পরিমাণে লগ জেনারেট হলে কয়েক মাসের মধ্যে এই লগ ফাইলটি কয়েকশ গিগাবাইট জায়গা দখল করে হোস্ট ওএসের সম্পূর্ণ ডিস্ক স্পেস ফুল করে ফেলে এবং সার্ভারকে সম্পূর্ণ ডাউন করে দেয়।

---

### Senior Solution: Dual Logging & Non-Blocking Buffering

প্রোডাকশন গ্রেড সিস্টেমে এই লগ বিপর্যয় এড়াতে সিনিয়র ইঞ্জিনিয়াররা ডকার ডেমন কনফিগারেশনে (`/etc/docker/daemon.json`) নিচের বেস্ট প্র্যাকটিস মেকানিজম কনফিগার করেন:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3",
    "mode": "non-blocking",
    "max-buffer-size": "4m"
  }
}
```

#### কনফিগারেশনের ইন্টারনাল মেকানিক্স:

- **`max-size` & `max-file` (Log Rotation):** লগের সাইজ ৫০MB পার হলে ডকার অটোমেটিক পুরনো লগ ডিলিট করে নতুন ফাইলে রাইট করবে এবং সর্বোচ্চ ৩টি ফাইল স্টোর রাখবে। এর ফলে ডিস্ক ফুল হওয়ার রিস্ক ০% হয়ে যায়।
- **`mode: non-blocking` (রিং বাফার পারফরম্যান্স):** ডিফল্ট অবস্থায় ডকার ব্লকিং মোডে কাজ করে। অর্থাৎ যদি ডিস্ক I/O স্লো হয়, ডকার লগ ফাইল রাইট করতে না পারা পর্যন্ত অ্যাপ্লিকেশনের মেইন থ্রেডকে ব্লক করে রাখে। এর ফলে অ্যাপ্লিকেশনের স্পিড নাটকীয়ভাবে কমে যায়।
- `non-blocking` অন করলে ডকার কার্নেলে ৪MB-এর একটি **Ring Buffer** তৈরি করে। অ্যাপ্লিকেশন লগের ডেটা বাফারে ফেলে সাথে সাথে কাজ এগিয়ে নিয়ে যায়, ডকার ব্যাকগ্রাউন্ডে বাফার থেকে ডেটা রিড করে ফাইল রাইট করে। বাফার ফুল হয়ে গেলে ডকার রিং মেথডে পুরনো লগ ওভাররাইট করে অ্যাপ্লিকেশনের পারফরম্যান্স গ্যারান্টিড হাই রাখে।

---

## ১৩. Running OCI Containers Without Docker (ডকার ছাড়া কন্টেইনার রান!)

বেশিরভাগ ডেভেলপার মনে করেন কন্টেইনার রান করতে অবশ্যই ডকার ডেমোন (`dockerd`) বা কুবারনেটিস লাগবে। কিন্তু আপনি চাইলে ডকার সম্পূর্ণ আনইনস্টল করে দিয়েও কেবল একটি লো-লেভেল ওটিআই (**OCI**) রানটাইম **`runc`** এবং লিনাক্স কার্নেলের সাহায্যে কন্টেইনার স্পন ও রান করতে পারেন!

```mermaid
flowchart TD
    subgraph OCIBypass [Spawning OCI Container without Docker]
        direction TB
        BaseApp["1. Export Alpine RootFS <br>(tarball extracted to /rootfs)"]
        SpecGen["2. runc spec <br>(Generates config.json metadata)"]
        RuncRun["3. runc run my-container <br>(runc talks to Kernel directly)"]

        Kernel["Linux Kernel <br>(Ring 0 Namespaces & cgroups)"]

        BaseApp --> SpecGen
        SpecGen --> RuncRun
        RuncRun --> Kernel
    end

    style BaseApp fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style SpecGen fill:#7c2d12,stroke:#f97316,color:#fff
    style RuncRun fill:#065f46,stroke:#10b981,color:#fff
```

### কীভাবে ডকার ছাড়া কন্টেইনার চালাবেন (The Manual Steps):

1. **Create Root Directory (rootfs):** প্রথমে কন্টেইনারের ওএস বা রুট ফাইল সিস্টেমের জন্য একটি ডিরেক্টরি বানিয়ে তাতে ফাইলগুলো এক্সপোর্ট করে নিন।
   ```bash
   mkdir -p my-container/rootfs
   # ডকার দিয়ে টেম্পোরারি আলপাইন ইমেজ তৈরি করে তা টার ফাইলে এক্সপোর্ট করে নিন
   docker export $(docker create alpine) | tar -C my-container/rootfs -xvf -
   ```
2. **Generate OCI Specification:** এবার `my-container` ডিরেক্টরিতে গিয়ে রানটাইম কনফিগারেশন ফাইল `config.json` তৈরি করুন:
   ```bash
   cd my-container
   runc spec
   ```

   - এটি একটি স্ট্যান্ডার্ড `config.json` ফাইল তৈরি করবে, যেখানে কন্টেইনারের সমস্ত নেমস্পেস, মাউন্ট পয়েন্ট, মেমরি লিমিট এবং রান কমান্ড ডিফাইন করা থাকে।
3. **Run the Container Directly:** এবার ডকার ডেমোন ছাড়াই সরাসরি `runc` দিয়ে কন্টেইনারটি স্পন করুন:
   ```bash
   sudo runc run my-custom-container
   ```
   ব্যাস! আপনি এখন সরাসরি আলপাইন কন্টেইনারের ভেতরের শেলের (`/bin/sh`) মধ্যে ঢুকে গেছেন। এটি প্রমাণ করে ডকার আসলে লিনাক্স কার্নেল ও স্ট্যান্ডার্ড ওআইসি স্পেসিফিকেশনের ওপর মোড়ানো একটি চমৎকার ম্যানেজমেন্ট র্যাপার মাত্র।

---

## ১৪. The Deep Syscalls of Containment: `clone`, `unshare`, and `setns`

ডকার বা `runc` যখন ব্যাকগ্রাউন্ডে কন্টেইনার তৈরি করে, প্রোগ্রামিং ল্যাঙ্গুয়েজ লেভেলে (যেমন C বা Go-তে) লিনাক্স কার্নেলের ৩টি অতি-গুরুত্বপূর্ণ সিস্টেম কল ট্রিগার করা হয়। এই ৩টি সিস্টেম কল ছাড়া কন্টেইনারাইজেশন অসম্ভব:

```mermaid
flowchart TD
    subgraph SyscallInternals [Container Isolation System Calls]
        Sys_Clone["1. clone() Syscall <br>Creates new process inside <br>new Namespace flags"]
        Sys_Unshare["2. unshare() Syscall <br>Detaches current process <br>from parent namespace"]
        Sys_Setns["3. setns() Syscall <br>Joins an already existing <br>Namespace (docker exec)"]
    end

    style Sys_Clone fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Sys_Unshare fill:#7c2d12,stroke:#f97316,color:#fff
    style Sys_Setns fill:#065f46,stroke:#10b981,color:#fff
```

### ১. `clone()` - দ্য কন্টেইনার ক্রিয়েটর

লিনাক্সে নতুন প্রসেস তৈরি করতে প্রথাগতভাবে `fork()` ব্যবহৃত হতো। কিন্তু কন্টেইনার বানাতে ব্যবহৃত হয় **`clone()`** সিস্টেম কল।

- `clone()` রান করার সময় আমরা কার্নেল লেভেলে স্পেসিফিক আইসোলেশন ফ্ল্যাগ পাস করতে পারি:
  ```c
  // C Code Example: Creating namespaces programmatically
  int child_pid = clone(child_main, stack + STACK_SIZE,
                        CLONE_NEWPID | CLONE_NEWNET | CLONE_NEWNS | SIGCHLD, NULL);
  ```
  কার্নেল এই ফ্ল্যাগগুলো দেখে প্রসেসটির জন্য সম্পূর্ণ নতুন PID, Network এবং Mount নেমস্পেস তৈরি করে দেয়।

### ২. `unshare()` - বাউন্ডারি সেপারেটর

এই সিস্টেম কলটি একটি রানিং প্রসেসকে তার প্যারেন্টের বা হোস্টের শেয়ার্ড স্পেস থেকে ডিটাচ করে সম্পূর্ণ স্বাধীন নেমস্পেস বাউন্ডারিতে নিয়ে যায়। এটি প্রসেসকে হোস্টের ফাইল মাউন্ট বা নেটওয়ার্ক ভিউ থেকে তাৎক্ষণিক আইসোলেট করার জন্য ব্যবহৃত হয়।

### ৩. `setns()` - দ্য সিক্রেট অব `docker exec`

অনেকেই কনফিউজড থাকেন এই ভেবে যে, `docker exec -it <id> sh` কমান্ড দিলে ডকার কীভাবে একটি চলমান কন্টেইনারের সুরক্ষিত দেয়াল ভেঙে ভেতরে গিয়ে শেল চালু করে দেয়?

- **The Secret:** ডকার কিন্তু কন্টেইনারের ভার্চুয়াল ডিস্ক হ্যাক করে না। সে হোস্ট মেশিনে একটি নতুন সাধারণ প্রসেস স্পন করে। তারপর কার্নেলে টার্গেট কন্টেইনারের নেমস্পেস ফাইল ডেসক্রিপ্টরগুলোর পাথ খুঁজে বের করে (লিনাক্সে এগুলো `/proc/<PID>/ns/` ডিরেক্টরিতে থাকে)।
- ডকার তখন কার্নেলে **`setns(fd, nstype)`** সিস্টেম কল ট্রিগার করে। এটি আমাদের নতুন স্পন হওয়া সাধারণ প্রসেসটিকে জোর করে কন্টেইনারের ভেতরের সুরক্ষিত PID ও NET নেমস্পেস বাউন্ডারিতে ঢুকিয়ে দেয়। ফলে প্রসেসটি হোস্টের ফাইল দেখা বন্ধ করে কন্টেইনারের ভেতরের ফাইল ও নেটওয়ার্ক ইন্টারফেস দেখা শুরু করে!

---

## ১৫. OverlayFS Inode Exhaustion (ইনোড শেষ হয়ে যাওয়ার রহস্যময় বিপর্যয়)

প্রোডাকশন সিস্টেমে একটি অত্যন্ত পরিচিত অথচ রহস্যময় বিপর্যয় হলো—সার্ভারে হঠাৎ করেই `No space left on device` এরর দেখায় এবং নতুন কোনো ফাইল বা ডেটা রাইট করা যায় না। অথচ ইঞ্জিনিয়াররা সার্ভারে ঢুকে `df -h` দিয়ে চেক করে দেখেন ডিস্কে হয়তো আরও **৮০% মেমরি সম্পূর্ণ খালি পড়ে আছে!**

এই রহস্যময় বিপর্যয়ের মূল কারণ হলো **Inode Starvation (ইনোড নিঃশেষ হওয়া)**।

### Inode কী?

লিনাক্স ফাইলসিস্টেমে প্রতিটা ফাইল, ডিরেক্টরি বা সিম্বলিক লিংকের জন্য একটি ইউনিক মেটাডেটা এন্ট্রি ব্লক থাকে যাকে **Inode (Index Node)** বলে। ডিস্ক ফরম্যাট করার সময় ওএস-এ ফিক্সড সংখ্যার ইনোড লিমিট কনফিগার করে দেওয়া হয়। আপনার ডিস্কে ১০০GB ফ্রী স্পেস থাকলেও যদি ইনোড কাউন্টার শেষ হয়ে যায়, তবে কার্নেল নতুন কোনো ফাইল রাইট করতে দেবে না।

### ডকারে কীভাবে ইনোড শেষ হয়?

আমরা যখন কন্টেইনারে প্রচুর ইমেজ বিল্ড করি বা CI/CD রানারে ঘন ঘন শত শত টেম্পোরারি শর্ট-লাইভড (short-lived) কন্টেইনার চালাই:

- ডকারের **Overlay2** স্টোরেজ ড্রাইভার ডকার ইমেজের প্রতিটা লেয়ার এবং কন্টেইনারের রানটাইম ফাইলের জন্য ব্যাকগ্রাউন্ডে হাজার হাজার ডিরেক্টরি, কপি-অন-রাইট (CoW) হার্ডলিংক ও মেটাডেটা নোড তৈরি করে।
- এই প্রচুর পরিমাণ ফাইল জেনারেট হওয়ার ফলে হোস্ট ওএসের ইনোড কোটা দ্রুত ফুরিয়ে যায়।

```bash
# আপনার সিস্টেমে ইনোড ফুরিয়ে গেছে কিনা তা চেক করার কমান্ড
df -i
```

আউটপুটে যদি দেখা যায় `/dev/xvda1` এর `IUse%` ১০০% হয়ে গেছে, তার মানে ইনোড শেষ!

### সিনিয়র ডিবাগিং সমাধান:

এই ইনোড ক্র্যাশ থেকে সার্ভারকে বাঁচাতে নিয়মিত ডকার ক্লিনিং এবং সিস্টেম প্রুনিং ডেমোন কনফিগার করতে হয়:

```bash
# অব্যবহৃত সব ইমেজ, স্টপড কন্টেইনার ও ক্যাশ লেয়ারের ইনোড মেমরি ফ্রি করার কমান্ড
docker system prune -a --volumes -f
```

---

## ১৬. User Namespaces Mapping: Rootless Docker Internals (রুটলেস ডকার)

প্রথাগতভাবে ডকার ডেমোন হোস্ট ওএসের `root` ইউজারের প্রিভিলেজ নিয়ে ব্যাকগ্রাউন্ডে চলে। ফলে কন্টেইনার হ্যাক হলে সম্পূর্ণ হোস্ট সার্ভার হ্যাক হওয়ার চরম সিকিউরিটি ঝুঁকি থাকে। এই ঝুঁকি চিরতরে দূর করতে আধুনিক সিকিউর ডেভঅপ্স আর্কিটেকচারে **Rootless Docker** ব্যবহার করা হয়।

রুটলেস ডকারের মূল চালিকাশক্তি হলো লিনাক্স কার্নেলের **User Namespaces** এবং **UID/GID Mapping**।

```mermaid
flowchart LR
    subgraph Container_UserSpace [Container Namespace - User Mode]
        Root_In["Root User Inside <br>(UID 0)"]
    end

    subgraph Host_UserSpace [Host OS Namespace - Kernel Mode]
        High_UID["Unprivileged Host User <br>(UID 100000)"]
        Real_User["Real Host Non-Root User <br>(UID 1000)"]
    end

    Root_In -->|Mapped via /etc/subuid| High_UID
    High_UID -.->|Parent Privilege| Real_User

    style Root_In fill:#7c2d12,stroke:#f97316,color:#fff
    style High_UID fill:#065f46,stroke:#10b981,color:#fff
    style Real_User fill:#1e3a8a,stroke:#3b82f6,color:#fff
```

### কীভাবে রুটলেস ইউজার ম্যাপিং কাজ করে?

রুটলেস ডকার হোস্টের লিনাক্স ফাইলের `/etc/subuid` এবং `/etc/subgid` ব্যবহার করে কন্টেইনারের ভেতরের ইউজার আইডি হোস্টের সম্পূর্ণ ভিন্ন ও সেফ ইউজার আইডিতে ট্রান্সলেট করে দেয়।

1. **Inside the Container:** কন্টেইনারের ভেতরে অ্যাপ্লিকেশনটি মনে করে সে সম্পূর্ণ প্রিভিলেজড **`root`** (UID 0) ইউজার হিসেবে কোড রান করছে এবং ডেটা রাইট করছে।
2. **Outside on the Host:** কার্নেল লেভেলে ম্যাপ করার কারণে হোস্ট ওএস দেখতে পায় ফাইলটি আসলে লিখছে **UID 100000** (একটি সাধারণ আন-প্রিভিলেজড সাব-ইউজার)।
3. **The Defense:** যদি কোনো হ্যাকার কন্টেইনার থেকে বের হয়ে ডিরেক্টরি ট্রাভার্স করার চেষ্টা করে, হোস্ট কার্নেল তাকে সাধারণ ইউজার (UID 100000) হিসেবে ট্রিট করে সম্পূর্ণ ব্লক করে দেয়। সে হোস্ট ওএসের কোনো রুট পারমিশন বা সিস্টেম ফাইল টাচ করার সুযোগ পায় না।

---

## ১৭. Network Namespace Plumbing: Virtual Cable Insertion (veth Plumbing)

আমরা আগেই জেনেছি ডকার ব্রিজ নেটওয়ার্কের জন্য এক জোড়া ভার্চুয়াল কেবল বা **`veth` pair** তৈরি করে। তবে ডকার ইঞ্জিন ব্যাকগ্রাউন্ডে লিনাক্স কার্নেল কমান্ড ব্যবহার করে কীভাবে প্রোগ্রেসিভলি এই ক্যাবলটিকে কন্টেইনারের সুরক্ষিত নেমস্পেসের ভেতর প্লাগ-ইন করে, তার ম্যানুয়াল মেকানিজম অত্যন্ত চমকপ্রদ।

নিচে আমরা ডকার ডেমোন ছাড়া সম্পূর্ণ ম্যানুয়ালি নেটওয়ার্ক প্লাগিং ও রাউটিং সেটআপ করার লিনাক্স কার্নেল কমান্ডগুলো দেখব:

### ধাপ ১: veth Pair এবং Bridge তৈরি করা

প্রথমে হোস্ট মেশিনে একটি লজিক্যাল ব্রিজ ও এক জোড়া ভার্চুয়াল কেবল নেট ইন্টারফেস তৈরি করি:

```bash
# veth pair তৈরি (ক্যাবলের দুই মাথা: veth_host এবং veth_container)
sudo ip link add veth_host type veth peer name veth_container
```

### ধাপ ২: ক্যাবলের এক মাথা কন্টেইনারের নেমস্পেসে পুশ করা

লিনাক্সে প্রতিটা রানিং কন্টেইনারের একটি নির্দিষ্ট নেটওয়ার্ক নেমস্পেস থাকে (যেমন তার PID যদি হয় ৯৫২০):

```bash
# veth_container ইন্টারফেসটিকে জোর করে কন্টেইনারের নেমস্পেসের ভেতর পাঠিয়ে দেওয়া
sudo ip link set veth_container netns 9520
```

### ধাপ ৩: কন্টেইনারের ভেতরে ইন্টারফেস রিনেম ও আইপি সেটআপ

কন্টেইনারের ভেতরে ঢুকে ক্যাবল ইন্টারফেসটি চালু করে তাকে স্ট্যান্ডার্ড নাম `eth0` দিতে হবে:

```bash
# কন্টেইনারের ভেতরে ইন্টারফেসটির নাম veth_container থেকে পরিবর্তন করে eth0 করা
sudo nsenter -t 9520 -n ip link set dev veth_container name eth0
# ইন্টারফেসটি চালু করা
sudo nsenter -t 9520 -n ip link set eth0 up
# কন্টেইনারের ভেতরে আইপি অ্যাসাইন করা
sudo nsenter -t 9520 -n ip addr add 172.17.0.2/16 dev eth0
```

### ধাপ ৪: ক্যাবলের অন্য মাথা হোস্টের ব্রিজে প্লাগ করা

হোস্ট ওএসে থাকা ক্যাবলের বাকি অংশটি ব্রিজে প্লাগ করে কানেকশন অন করে দিতে হবে:

```bash
# ক্যাবলের অন্য মাথাটি docker0 ব্রিজে কানেক্ট করা
sudo ip link set veth_host master docker0
# ইন্টারফেস চালু করা
sudo ip link set veth_host up
```

ব্যাস! কন্টেইনার ও হোস্টের ব্রিজের মাঝে ভার্চুয়াল ক্যাবল কানেক্টিভিটি সম্পূর্ণ সচল হয়ে গেল। এই চমৎকার ব্যাকএন্ড কার্নেল প্লাম্বিংটিই ডকার ডেমোন প্রতিবার নতুন কন্টেইনার চালু হওয়ার সময় নিঃশব্দে সম্পাদন করে থাকে।

---

## ১৮. Mount Propagation: Shared, Slave, and Private Mounts

আমরা যখন কন্টেইনারে `Volume` বা `Bind Mount` ব্যবহার করি, তখন লিনাক্স কার্নেলের মাউন্ট নেমস্পেসের একটি স্পর্শকাতর ও অতি-উন্নত ফিচার ব্যবহৃত হয়—**Mount Propagation**। এটি নির্ধারণ করে যে হোস্ট ওএস বা কন্টেইনারের ভেতরে করা কোনো নতুন মাউন্ট অ্যাকশন একে অপরের ফাইলসিস্টেমে কীভাবে প্রোপাগেট (প্রসারিত) হবে।

```mermaid
flowchart TD
    subgraph MountPropagation ["Mount Propagation Behaviors"]
        direction TB
        subgraph PrivateMode ["Private / rprivate (Default)"]
            HostP["Host Mounts Drive"] -.-x|Blocked| ContP["Container NOT Seeing"]
        end

        subgraph SharedMode ["Shared / rshared"]
            HostS["Host Mounts Drive"] --->|Propagates| ContS["Container Sees Drive"]
            ContS2["Container Mounts Drive"] --->|Propagates| HostS2["Host Sees Drive"]
        end

        subgraph SlaveMode ["Slave / rslave"]
            HostSl["Host Mounts Drive"] --->|Propagates| ContSl["Container Sees Drive"]
            ContSl2["Container Mounts Drive"] -.-x|Blocked| HostSl2["Host NOT Seeing"]
        end
    end

    style HostP fill:#7c2d12,stroke:#f97316,color:#fff
    style HostS fill:#065f46,stroke:#10b981,color:#fff
    style ContS2 fill:#065f46,stroke:#10b981,color:#fff
    style HostSl fill:#1e3a8a,stroke:#3b82f6,color:#fff
```

ডকার মাউন্ট প্রোপাগেশনের জন্য ৩টি প্রধান মোড সাপোর্ট করে:

### ১. `private` / `rprivate` (ডিফল্ট মোড):

- **মেকানিজম:** মাউন্ট নেমস্পেস সম্পূর্ণ আইসোলেটেড থাকে। হোস্ট মেশিনে মাউন্ট করা ডিরেক্টরির নিচে যদি নতুন কোনো ড্রাইভ মাউন্ট করা হয়, কন্টেইনারের ভেতরে তা দেখা যাবে না। একইভাবে কন্টেইনারের ভেতরে মাউন্ট করলে হোস্টে দেখা যাবে না।
- **ব্যবহার:** এটি সবচেয়ে নিরাপদ মোড। ডকার ডিফল্টভাবে এই সিকিউরিটি বাউন্ডারি বজায় রাখে।

### ২. `shared` / `rshared` (উভয়মুখী প্রসার):

- **মেকানিজম:** মাউন্ট প্রোপাগেশন দ্বিমুখী কাজ করে। হোস্ট যদি মাউন্ট পয়েন্টের নিচে নতুন ড্রাইভ প্লাগ করে, কন্টেইনার তা সাথে সাথে দেখতে পায়। আবার কন্টেইনারের ভেতরে কোনো নেটওয়ার্ক ড্রাইভ মাউন্ট করা হলে হোস্টও তা সাথে সাথে এক্সেস করতে পারে।
- **ব্যবহার:** কন্টেইনারাইজড স্টোরেজ ড্রাইভার বা ব্যাকআপ এজেন্ট যারা কন্টেইনারের ভেতর থেকে হোস্টের মাউন্ট পয়েন্ট ম্যানেজ করে, তাদের জন্য এটি দরকারি।

### ৩. `slave` / `rslave` (একমুখী প্রসার):

- **মেকানিজম:** এটি একমুখী (One-way) প্রোপাগেশন। হোস্ট মেশিনে করা যেকোনো মাউন্ট কন্টেইনারের ভেতরে ভিজিবল হবে, কিন্তু কন্টেইনারের ভেতরে কোনো ড্রাইভ মাউন্ট করা হলে হোস্ট কার্নেল তা সম্পূর্ণ ইগনোর করবে।
- **ব্যবহার:** হোস্টের সিস্টেম লগের মাউন্ট মনিটরিং করার জন্য এটি অত্যন্ত নিরাপদ ও বহুল ব্যবহৃত।

---

## ১৯. IPTables Plumbing, Routing Chains & Connection Tracking (Conntrack) Limits

ডকার নেটওয়ার্কিং মূলত হোস্ট ওএসের কার্নেল ফায়ারওয়াল **`iptables`**-এর ওপর সম্পূর্ণ নির্ভরশীল। আমরা যখন ডকার নেটওয়ার্ক সার্ভিস চালাই, ডকার আমাদের অজান্তেই লিনাক্স কার্নেলের প্যাকেট ফিল্টারিং টেবিলে নিজের নেটওয়ার্ক রুলসের একটি বিশাল জাল বুনে ফেলে।

### ডকারের কাস্টম IPTables Chains:

ডকার হোস্টের `iptables`-এ কতগুলো নিজস্ব চেইন তৈরি করে:

- **`DOCKER` Chain:** বাইরে থেকে আসা সমস্ত প্যাকেট (Inbound Packets) পরীক্ষা করে কন্টেইনারের পোর্ট বাইন্ডিং ও NAT (Network Address Translation) রুলস অ্যাপ্লাই করে।
- **`DOCKER-USER` Chain:** ডকার ডেমোন তার নিজস্ব রুলসগুলোর আগে এই চেইনটি রান করায়। আপনি যদি কন্টেইনারের কোনো নির্দিষ্ট পোর্টে ফায়ারওয়াল ব্লক বা কাস্টম আইপি ফিল্টারিং বসাতে চান, তবে সরাসরি এই চেইনে রুল লিখতে হবে (কারণ ডিফল্ট `DOCKER` চেইনে লিখলে ডকার রিস্টার্টের সময় তা মুছে যায়)।

```mermaid
flowchart LR
    Packet[Inbound Network Packet] --> PREROUTING[NAT PREROUTING Table]
    PREROUTING -->|DOCKER Chain| NAT[Port Forwarding & DNAT]
    NAT --> Conntrack[Conntrack Table <br>Tracks TCP Connection State]
    Conntrack --> Container[Target Container Namespace]

    style PREROUTING fill:#7c2d12,stroke:#f97316,color:#fff
    style Conntrack fill:#065f46,stroke:#10b981,color:#fff
```

### The Conntrack Table Full Disaster (হাই-ট্রাফিক সার্ভার ক্র্যাশ)

উচ্চ ট্রাফিকের মাইক্রোসার্ভিস সিস্টেমে (যেখানে প্রতি সেকেন্ডে হাজার হাজার কন্টেইনার টু কন্টেইনার রিকোয়েস্ট বা ডাটাবেস কোয়েরি চলে) প্রায়ই একটি নেটওয়ার্কিং বিপর্যয় ঘটে। কন্টেইনারগুলো একে অপরের সাথে যোগাযোগ করা বন্ধ করে দেয় এবং লগে `connection timed out` বা হোস্টের `dmesg` লগে নিচের এররটি দেখায়:

```
nf_conntrack: table full, dropping packet
```

#### বিপর্যয় মেকানিক্স:

লিনাক্স কার্নেল প্রতিটা নেটওয়ার্ক কানেকশন ট্র্যাক করতে **Conntrack (Connection Tracking)** টেবিল ব্যবহার করে।

- উচ্চ ট্রাফিকের কারণে যখন কন্টেইনারের ওপেন সকেট ও কানেকশনের সংখ্যা কার্নেলের ডিফল্ট `net.netfilter.nf_conntrack_max` লিমিট পার করে যায়, কার্নেল আর নতুন কোনো কানেকশন টেবিলে ঢুকতে দেয় না এবং প্যাকেট ড্রপ করা শুরু করে।

#### সিনিয়র নেটওয়ার্ক টিউনিং সমাধান:

উচ্চ ট্রাফিকের প্রোডাকশন হোস্টে এই সমস্যা দূর করতে কার্নেলের `sysctl` দিয়ে কানেকশন ট্র্যাকিং টেবিলের সাইজ বাড়িয়ে ও উইন্ডো টাইম কমিয়ে নিতে হয়:

```bash
# conntrack টেবিলের সর্বোচ্চ লিমিট ১০ লাখে উন্নীত করা
sysctl -w net.netfilter.nf_conntrack_max=1048576
# এস্টাবলিশড TCP কানেকশন ট্র্যাকিং বাফার টাইম কমিয়ে ৬০০ সেকেন্ড করা
sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=600
```

---

## ২০. The Kernel OOM Killer & CGroups `oom_score_adj` (আউট অব মেমরি মেকানিক্স)

কন্টেইনারাইজড অ্যাপ্লিকেশনে মেমরি লিক বা মেমরি ওভারফ্লো হলে কার্নেল প্রসেসটিকে বন্ধ করে দেয়, যাকে আমরা **OOM Killed (Exit Code 137)** বলি। তবে এর পেছনে লিনাক্স কার্নেলের যে জটিল কিলিং মেকানিজম কাজ করে, তা জানা অত্যন্ত জরুরি।

### OOM Killer Score (আউটিং স্কোর):

হোস্ট লিনাক্স ওএসের যখন মেমরি সম্পূর্ণ ফুরিয়ে যায়, কার্নেল তার নিজের অস্তিত্ব বাঁচাতে **Out Of Memory (OOM) Killer** অ্যালগরিদম ট্রিগার করে। কার্নেল হোস্টের প্রতিটি রানিং প্রসেসকে পরীক্ষা করে ০ থেকে ১০০০ পর্যন্ত একটি **`oom_score`** দেয়।

- যার মেমরি ব্যবহারের পার্সেন্টেজ ও প্রসেস ক্রিয়েশন প্যারামিটার বেশি, তার `oom_score` তত বেশি হয়।
- OOM Killer সর্বোচ্চ ওম-স্কোর প্রাপ্ত প্রসেসটিকে সাথে সাথে `SIGKILL` পাঠিয়ে হত্যা করে হোস্টের মেমরি ফ্রি করে।

### CGroups ও `oom_score_adj` (ডকারের চালবাজি):

ডকার কন্টেইনার চালানোর সময় কার্নেলের মেমরি ম্যানেজমেন্ট কন্ট্রোল করতে ও হোস্টের সুরক্ষায় একটি চমৎকার ট্রিক ব্যবহার করে। ডকার প্রতিটা কন্টেইনার প্রসেসের জন্য হোস্টের `/proc/<PID>/oom_score_adj` ফাইলে একটি এডজাস্টমেন্ট স্কোর লিখে দেয়।

```bash
# কন্টেইনার প্রসেসের ওম স্কোর এডজাস্টমেন্ট ফাইল পাথ
cat /proc/<CONTAINER_PID>/oom_score_adj
```

- **ডিফল্ট আচরণ:** ডকার কন্টেইনারের মেমরি প্রসেসের ওম স্কোর পজিটিভলি বাড়িয়ে দেয়। এর ফলে হোস্ট ওএসে মেমরির সংকট দেখা দিলে কার্নেল সবার আগে কন্টেইনার প্রসেসগুলোকে হত্যা করবে, কিন্তু হোস্টের স্পর্শকাতর মূল প্রসেস (যেমন: `dockerd`, `sshd`, বা ওএস ডেমোন) অক্ষত রাখবে।
- **Custom Override:** আপনি যদি চান আপনার কোনো অত্যন্ত গুরুত্বপূর্ণ কন্টেইনার (যেমন: মেইন ডাটাবেস কন্টেইনার) মেমরি ফুরিয়ে গেলেও কার্নেল যেন কোনো অবস্থাতেই তাকে কিল না করে, তবে আপনি ওম স্কোর এডজাস্টার নেগেটিভ ভ্যালুতে কনফিগার করতে পারেন:
  ```bash
  # ওম স্কোর এডজাস্টার -১০০০ করে দেওয়া (এর ফলে OOM Killer কন্টেইনারটিকে কখনই কিল করবে না)
  docker run -d --oom-score-adj=-1000 my-database
  ```

---

### ওএম কিল নিষ্ক্রিয় করা (`oom_kill_disable`):

মেমরি ফুল হলে কন্টেইনার ক্র্যাশ করার পরিবর্তে প্রসেসটিকে সাময়িকভাবে ফ্রিজ (Pause) করে রাখতে চাইলে আপনি ওএম কিলার সম্পূর্ণ অফ করে দিতে পারেন:

```bash
docker run -d --oom-kill-disable --memory=512m my-app
```

_এটি ব্যবহারের ফলে কন্টেইনারটি মেমরি লিমিটে পৌঁছালে কার্নেল তাকে কিল করবে না, বরং মেমরি রিলিজ না হওয়া পর্যন্ত প্রসেসটিকে ফ্রিজ করে আটকে রাখবে। তবে সাবধান! এটি হোস্টের মেমরির ওপর অতিরিক্ত চাপ সৃষ্টি করতে পারে।_

---

## ২১. Container Breakouts: CVE-2019-5736 & runc Vulnerability Internals

কন্টেইনারের মূল লক্ষ্য হলো হোস্ট ওএস থেকে সম্পূর্ণ আইসোলেটেড থাকা। কিন্তু ইতিহাসে এমন কিছু চরম কার্নেল সিকিউরিটি বাগ দেখা গেছে যার মাধ্যমে হ্যাকাররা কন্টেইনারের দেয়াল সম্পূর্ণ ভেঙে হোস্ট ওএসের রুট এক্সেস নিয়ে নিয়েছে—একে বলা হয় **Container Breakout**।

এর মধ্যে সবচেয়ে বৈপ্লবিক ও কুখ্যাত ব্রেকআউট বাগটি ছিল **CVE-2019-5736 (runC Vulnerability)**। এর মেকানিজমটি জানা থাকলে আপনি কন্টেইনার সিকিউরিটির গভীরতম ঝুঁকিগুলো উপলব্ধি করতে পারবেন।

```mermaid
sequenceDiagram
    autonumber
    actor Attacker as Attacker inside Container (Root)
    participant Exec as Admin running 'docker exec'
    participant Runc as Host runc Binary (Temporary execution)
    participant HostFS as Host File System (/usr/bin/runc)

    Attacker->>Attacker: 1. Overwrite target local binary (e.g. /bin/sh) with hook
    Exec->>Runc: 2. Invoke docker exec (runc spawns shell process)
    Note over Runc: runc enters container namespace
    Runc->>Attacker: 3. Executes hooked /bin/sh
    Note over Attacker: Attacker gets access to runc process via /proc/self/exe
    Attacker->>Runc: 4. Opens runc file descriptor for writing
    Runc->>Exec: 5. Exits after shell setup
    Attacker->>HostFS: 6. Overwrites host's /usr/bin/runc with malicious code
    Note over HostFS: Next time ANY docker command runs, malicious runc executes as HOST ROOT!
```

### কীভাবে runc ব্রেকআউট কাজ করত (The Exploit Mechanics):

1. **The Target Hook:** হ্যাকার প্রথমে কন্টেইনারের ভেতরের কোনো রুট বাইনারি ফাইলকে (যেমন: `/bin/sh`) একটি ম্যালিসিয়াস স্ক্রিপ্ট দিয়ে মডিফাই করে রাখে।
2. **The Exec Trap:** হোস্ট মেশিনের কোনো সিস্টেম এডমিনিস্ট্রেটর যখন কন্টেইনারের ভেতর তদন্ত করতে `docker exec -it <container_id> sh` কমান্ড দেন, হোস্ট ওএসের **`runc`** বাইনারিটি মেমরিতে লোড হয় এবং কন্টেইনারের নেমস্পেসের ভেতর ঢুকে ওই মডিফাইড `/bin/sh` প্রসেসটি চালু করে।
3. **The `/proc/self/exe` Magic:** লিনাক্সে রানিং প্রতিটা প্রসেস তার নিজের এক্সিকিউটেবল বাইনারি ট্র্যাক করতে `/proc/self/exe` নামের একটি ভার্চুয়াল ফাইল পয়েন্টার ব্যবহার করে। runc যখন কন্টেইনারের ভেতর প্রসেসটি অন করে, কন্টেইনারের ভেতরের ম্যালিসিয়াস কোডটি রিড করতে পারে যে, মেমরির ওই প্রসেস ফাইলের পেছনে হোস্ট ওএসের আসল `/usr/bin/runc` ফাইলটি মাউন্ট করা আছে!
4. **Overwriting the Host runc:** ম্যালিসিয়াস প্রসেসটি মেমরি থেকে সরাসরি হোস্টের `/usr/bin/runc` ফাইলের রাইট অ্যাক্সেস হ্যান্ডেল ওপেন করে ফেলে। runc প্রসেসটি কাজ শেষ করে হোস্ট মেমরি থেকে বের হয়ে যাওয়া মাত্র হ্যাকার কন্টেইনারের ভেতর থেকে হোস্টের মূল `runc` বাইনারিটি সম্পূর্ণ ওভাররাইট করে নিজের ক্ষতিকর কোড ঢুকিয়ে দেয়।
5. **Host Takeover:** এরপর হোস্ট মেশিনে যখনই পরবর্তীতে যেকোনো নতুন কন্টেইনার তৈরি বা কমান্ড রান করা হয়, হোস্ট ওএস হ্যাকারের মডিফাইড `runc` কোডটি রান করে। ফলে হ্যাকার হোস্ট ওএসের সম্পূর্ণ রুট প্রিভিলেজ পেয়ে যায়।

### আধুনিক প্রটেকশন (The Fix):

এই ঐতিহাসিক বাগটি ফিক্স করতে আধুনিক **`runc`**-এ রান করার সময় নিজের একটি টেম্পোরারি ক্লোন কপি মেমরির বেনামী ফাইলে (`memfd_create` syscall) রাইট করে তা রিড-অনলি হিসেবে লক করে প্রসেস রান করায়, যাতে কন্টেইনারের ভেতর থেকে কার্নেল কোনো অবস্থাতেই মূল হোস্ট বাইনারি ফাইল ওভাররাইট করতে না দেয়।

---

## ২২. Swap Memory Control & Swappiness (সোয়াপ মেমরি ও সোয়াপিনেস টিউনিং)

আমরা যখন কন্টেইনারে মেমরি লিমিট করি (যেমন: `-m 500m`), ব্যাকগ্রাউন্ডে কার্নেলের মেমরি সিগ্রুপ সচল হয়। তবে মেমরি লিমিটের সাথে **Swap Memory (সোয়াপ মেমরি)** কীভাবে ইন্টারঅ্যাক্ট করে, তা অনেকেই জানেন না।

```mermaid
flowchart TD
    subgraph RAM_Swap_Dynamics [Docker Memory vs. Swap Limits]
        direction TB
        AppMem[Container Allocates Memory]
        
        subgraph CGroups_Lim [CGroups Limits Checked]
            MemLimit["RAM Limit (-m 500m)"]
            SwapLimit["Swap Limit --memory-swap"]
        end
        
        AppMem -->|Exceeds RAM Limit| SwapCheck{Is Swap Enabled?}
        SwapCheck -->|Yes: --memory-swap=1g| UseSwap[Writes anonymous pages <br>to Host Swap Space]
        SwapCheck -->|No: --memory-swap=500m| OOMKill[Trigger OOM Killer / Exit Code 137]
    end

    style MemLimit fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style SwapLimit fill:#7c2d12,stroke:#f97316,color:#fff
    style OOMKill fill:#7f1d1d,stroke:#ef4444,color:#fff
```

### ১. Swap Limits (`--memory-swap`)
ডিফল্ট অবস্থায় আপনি যদি কন্টেইনারে ৫00MB র‍্যাম লিমিট করে সোয়াপ লিমিট সেট না করেন, তবে ডকার কন্টেইনারটিকে হোস্টের অতিরিক্ত ৫০০MB সোয়াপ স্পেস ব্যবহার করতে দেয় (মোট ১GB ভার্চুয়াল মেমরি)। 
- **সোয়াপ নিষ্ক্রিয় করার নিয়ম:** আপনি যদি চান মেমরি লিমিট ওভারফ্লো হওয়ামাত্রই যেন প্রসেসটি ক্র্যাশ করে এবং কোনো হোস্ট সোয়াপ ব্যবহার না করে, তবে `--memory-swap` ভ্যালু মেমরি লিমিটের সমান করে দেবেন:
  ```bash
  # র‍্যাম ৫০০MB এবং সোয়াপ ০ (সোয়াপ সম্পূর্ণ অফ)
  docker run -d -m 500m --memory-swap=500m nginx
  ```

### ২. Swappiness টিউনিং (`--memory-swappiness`)
সোয়াপিনেস হলো একটি ইন্টিজার ভ্যালু (০ থেকে ১০০) যা লিনাক্স কার্নেলকে নির্দেশ দেয় কন্টেইনারের র‍্যাম পেজগুলো হোস্টের হার্ডডিস্ক সোয়াপে ট্রান্সফার করতে সে কতটা ব্যাকুল বা এগ্রেসিভ হবে।
- **`--memory-swappiness=0`:** কার্নেল কন্টেইনারের র‍্যাম পেজগুলো কোনো অবস্থাতেই সোয়াপে পাঠাবে না, যদি না র‍্যাম একদম ১০০% ফুরিয়ে ওএম কিলার ট্রিগার হওয়ার উপক্রম হয়। এটি অ্যাপ্লিকেশনের পারফরম্যান্স সর্বোচ্চ হাই রাখে।
- **`--memory-swappiness=100`:** কার্নেল অত্যন্ত এগ্রেসিভলি কন্টেইনারের অব্যবহৃত র‍্যাম পেজগুলো সোয়াপে পাঠিয়ে দিয়ে কন্টেইনারের র‍্যাম খালি রাখবে। এটি পারফরম্যান্স কিছুটা কমিয়ে দেয় কিন্তু সাডেন ওএম কিল (OOM kill) প্রতিরোধে সাহায্য করে।

---

## ২৩. Docker Storage Drivers Deep-Dive: overlay2 vs. devicemapper vs. btrfs vs. zfs

আমরা OverlayFS সম্পর্কে জেনেছি, কিন্তু অপারেটিং সিস্টেম ও আইও (I/O) থ্রুপুটের ওপর ভিত্তি করে ডকার ব্যাকগ্রাউন্ডে ভিন্ন ভিন্ন স্টোরেজ ইঞ্জিন ব্যবহার করতে পারে। এদের আর্কিটেকচারাল পার্থক্য জানা প্রডাকশন স্টোরেজ ডিজাইনের জন্য অত্যন্ত জরুরি:

| Storage Driver | Architecture Level | Copy-on-Write (CoW) Mechanics | Best Use Case | Pros & Cons |
| :--- | :--- | :--- | :--- | :--- |
| **`overlay2`** | **File-level** | লিনাক্স ইউনিয়ন মাউন্ট ব্যবহার করে ফাইল সিস্টেমে ডিরেক্টরি লেয়ার তৈরি করে। | আধুনিক লিনাক্স ডিস্ট্রিবিউশন (ডিফল্ট স্ট্যান্ডার্ড)। | **Pros:** অত্যন্ত ফাস্ট, লো মেমরি ওভারহেড, হোস্ট পেজ ক্যাশ শেয়ার করতে পারে। <br>**Cons:** অতিরিক্ত ফাইলসিস্টেম অ্যাকশনে ইনোড নিঃশেষ হওয়ার ঝুঁকি। |
| **`devicemapper`** | **Block-level** | লিনাক্স LVM thin provisioning ব্যবহার করে কন্টেইনারের জন্য ভার্চুয়াল ব্লক ডিভাইস বানায়। | লিনাক্সের পুরাতন কার্নেল বা এন্টারপ্রাইজ আরএইচইএল (RHEL) সিস্টেম। | **Pros:** ব্লক লেভেলে কাজ করায় ডাটাবেস রাইটে লক কনটেনশন কম। <br>**Cons:** সেটআপ করা জটিল (Direct-LVM), পেজ ক্যাশ শেয়ার করতে পারে না, র‍্যাম বেশি খায়। |
| **`btrfs` / `zfs`** | **Filesystem-level** | ওএস লেভেলের CoW ফাইলসিস্টেমের সাব-ভলিউম এবং স্ন্যাপশট ব্যবহার করে। | ডকার হোস্টে যদি ইতিমধ্যে Btrfs বা ZFS ফাইলসিস্টেম সেটআপ করা থাকে। | **Pros:** ইমেজ বিল্ডিং ও স্ন্যাপশট তৈরি করতে সুপার ফাস্ট। <br>**Cons:** ZFS-এর মেমরি ফুটপ্রিন্ট অনেক বেশি, কার্নেলের সাথে ডিপ টাইট ইন্টিগ্রেশন প্রয়োজন। |
| **`vfs`** | **None** | কোনো CoW মেকানিজম নেই। প্রতিটা লেয়ারে ফাইল সম্পূর্ণ কপি করে ডিরেক্টরি ডুপ্লিকেট করে। | ডিবাগিং, ক্যাওস টেস্টিং ও ফাইল সিস্টেম ড্রাইভার টেস্ট। | **Pros:** জটিল কার্নেল ফিচারের ওপর ডিপেন্ডেন্সি নেই। <br>**Cons:** অত্যন্ত ধীরগতির, ডিস্ক স্পেস চোখের পলকে শেষ করে ফেলে। |

---

## ২৪. Namespace Sharing across Containers: Pod Architecture Internals (শেয়ার্ড নেমস্পেস)

কুবারনেটিস (Kubernetes)-এর একদম মৌলিক একক হলো **Pod (পড)**। একটি পডের মূল রহস্য হলো তার ভেতরে থাকা একাধিক কন্টেইনার একে অপরের সাথে সম্পূর্ণ আইসোলেটেড ফাইল সিস্টেমে থাকলেও তারা একই নেটওয়ার্ক আইপি (`localhost`) এবং ইন্টার-প্রসেস কমিউনিকেশন (`IPC`) স্পেস শেয়ার করে। 

ডকার ডেমোনের সাহায্যে আমরা কীভাবে ম্যানুয়ালি একটি কুবারনেটিস টাইপ **Pod Namespace Sharing** আর্কিটেকচার তৈরি করতে পারি?

```mermaid
flowchart TD
    subgraph PauseContainer [Pause / Infra Container <br>Holds the sandbox namespaces open]
        NetNS["Network Namespace <br>(IP: 172.17.0.5)"]
        IPCNS["IPC Namespace <br>(Shared Memory)"]
    end

    subgraph AppContainer [Application Container - Nginx]
        AppFile["Private RootFS"]
    end

    subgraph SidecarContainer [Sidecar Container - Log Shipper]
        SideFile["Private RootFS"]
    end

    AppContainer -->|Joins Network & IPC| PauseContainer
    SidecarContainer -->|Joins Network & IPC| PauseContainer

    style PauseContainer fill:#065f46,stroke:#10b981,color:#fff
    style NetNS fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style IPCNS fill:#7c2d12,stroke:#f97316,color:#fff
```

### ধাপ ১: অবকাঠামো বা Pause কন্টেইনার তৈরি করা
প্রথমে আমরা একটি অত্যন্ত লাইটওয়েট বেস কন্টেইনার তৈরি করব, যার একমাত্র কাজ হলো নেটওয়ার্ক ও আইপিসি নেমস্পেসগুলোকে জীবিত ধরে রাখা (একে কুবারনেটিসের ভাষায় **Pause** বা **Infra Container** বলে):
```bash
docker run -d --name pause-infra alpine sleep infinity
```

### ধাপ ২: অ্যাপ্লিকেশন কন্টেইনারকে ওই নেমস্পেসে যুক্ত করা
এবার আমরা আমাদের মেইন অ্যাপ্লিকেশন কন্টেইনার (Nginx) চালু করব, তবে তাকে নিজস্ব নেটওয়ার্ক ও আইপিসি না দিয়ে সরাসরি `pause-infra`-এর নেমস্পেসে জয়েন করিয়ে দেব:
```bash
docker run -d --name app-nginx --net=container:pause-infra --ipc=container:pause-infra nginx
```

### ধাপ ৩: সাইডকার কন্টেইনার জয়েন করানো
এবার আমরা একটি চাইল্ড বা হেল্পার (Sidecar) কন্টেইনার রান করব যা একই নেটওয়ার্ক শেয়ার করবে:
```bash
docker run -it --name helper-sidecar --net=container:pause-infra alpine ash
```

#### শেয়ার্ড মেকানিক্সের প্রমাণ:
আপনি যদি `helper-sidecar` কন্টেইনারের শেলের ভেতর ঢুকে টাইপ করেন:
```bash
# লোকালহোস্টের ৮০ পোর্টে কার্ল করা (এটি সরাসরি মেইন Nginx কন্টেইনারের রেসপন্স নিয়ে আসবে!)
apk add curl && curl localhost:80
```
আশ্চর্যজনকভাবে দেখতে পাবেন সাইডকার কন্টেইনারটি `localhost` ব্যবহার করেই সরাসরি মেইন অ্যাপের ডাটা রিড করতে পারছে! কারণ তারা একই ভার্চুয়াল নেটওয়ার্ক কার্ড এবং আইপি শেয়ার করছে। কুবারনেটিস প্রতিটা পডের ভেতরে ঠিক এই আন্ডার-দ্য-হুড ডকার মেকানিজমটি ব্যবহার করে সাইডকার প্যাটার্ন তৈরি করে।

---

## ২৫. Multi-Host Container Networking: VxLAN Overlay Networks

আমাদের কন্টেইনারগুলো যখন দুটি সম্পূর্ণ ভিন্ন ফিজিক্যাল সার্ভারে (Host A এবং Host B) থাকে, তখন তারা একে অপরের সাথে ব্রিজ নেটওয়ার্কের মাধ্যমে সরাসরি কথা বলতে পারে না। এই সমস্যার সমাধানে ডকার **VxLAN (Virtual Extensible LAN) Overlay Network** ব্যবহার করে একটি ডিস্ট্রিবিউটেড ভার্চুয়াল ফ্ল্যাট নেটওয়ার্ক তৈরি করে।

```mermaid
flowchart LR
    subgraph HostA [Physical Host A - IP: 192.168.1.100]
        ContA["Container A <br>IP: 10.0.0.2"]
    end

    subgraph PhysicalNetwork [Physical L3 Network / Switch]
        EncapsulatedPacket["UDP Encapsulated Packet <br>Destination Host B (Port 4789)"]
    end

    subgraph HostB [Physical Host B - IP: 192.168.1.200]
        ContB["Container B <br>IP: 10.0.0.3"]
    end

    ContA --->|Sends Frame to 10.0.0.3| HostA
    HostA -->|Wraps inside VxLAN Tunnel| EncapsulatedPacket
    EncapsulatedPacket --> HostB
    HostB -->|Strips UDP Header & delivers frame| ContB

    style HostA fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style HostB fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style EncapsulatedPacket fill:#7c2d12,stroke:#f97316,color:#fff
```

### কীভাবে VxLAN টানেলিং কাজ করে (The Tunneling Mechanics):

1. **The Distributed Key-Value Store:** ওভারলে নেটওয়ার্ক তৈরি করার সময় ডকার ডেমোনগুলোর মধ্যে একটি Raft বা ডিস্ট্রিবিউটেড কে-ভ্যালু ডাটাবেস ব্যাকগ্রাউন্ডে চালু থাকে। এটি ট্র্যাকিং করে কোন কন্টেইনার আইপিটি কোন ফিজিক্যাল হোস্ট আইপির আন্ডারে রানিং আছে।
2. **Encapsulation (প্যাকেট মোড়ানো):** Host A-তে থাকা Container A যখন Host B-তে থাকা Container B-কে (`10.0.0.3`) একটি প্যাকেট পাঠায়, Host A-এর কার্নেল ড্রাইভার দেখতে পায় এটি একটি ওভারলে নেটওয়ার্ক কল।
   - কার্নেল মূল ইথারনেট ফ্রেমটিকে অক্ষত রেখে তার মাথার ওপর একটি স্পেসিফিক **VxLAN Header** ও **Layer 4 UDP Header** (ডিফল্ট পোর্ট **৪৭৮৯**) পরিয়ে দেয়।
   - এই প্যাকেটের গন্তব্য আইপি হয় ফিজিক্যাল Host B-এর রিয়েল আইপি (`192.168.1.200`)।
3. **Transmission:** ফিজিক্যাল নেটওয়ার্ক বা ইন্টারনেট কেবল এই সাধারণ UDP প্যাকেটটিকে হোস্ট A থেকে হোস্ট B-তে রাউট করে নিয়ে যায়।
4. **Decapsulation (প্যাকেট খোলা):** Host B যখন ফিজিক্যাল পোর্ট ৪৭৮৯-এ প্যাকেটটি রিসিভ করে, হোস্টের ওভারলে কার্নেল ড্রাইভার বাইরের UDP হেডারটি ছিঁড়ে ফেলে ভেতরের মূল ইথারনেট ফ্রেমটি বের করে নেয়।
5. **Delivery:** কার্নেল তখন ফ্রেমটি সরাসরি Container B-এর লোকাল নেটওয়ার্ক নেমস্পেসের ভার্চুয়াল `eth0` ইন্টারফেসে পুশ করে দেয়। Container B মনে করে সে একই লোকাল সুইচের ভেতরে বসে সরাসরি পিন টু পিন ডাটা রিসিভ করেছে, মাঝখানের নেটওয়ার্ক রাউটিংয়ের কোনো জটিলতাই সে টেরও পায় না।

---

## ২৬. CPU Bandwidth Limits: CFS Scheduler & CPU Throttling (সিপিইউ থ্রটলিং)

আমরা যখন কন্টেইনারে সিপিইউ লিমিট সেট করি (যেমন: `--cpus=1.5` বা `--cpu-shares=512`), লিনাক্স কার্নেলের শিডিউলার লেভেলে দুটি ভিন্ন স্ট্র্যাটেজি অ্যাপ্লাই করা হয়। এই মেকানিজমটি না বুঝলে আপনার হাই-ট্রাফিক অ্যাপ্লিকেশন প্রোডাকশনে রহস্যময় পারফরম্যান্স ড্রপ বা লেটেন্সি স্পাইক (p99 latency spikes)-এর শিকার হবে।

```mermaid
flowchart TD
    subgraph CFSScheduler [CFS CPU Bandwidth Controller]
        direction TB
        subgraph TimeWindow [CFS Period Window - 100ms]
            TotalQuota["Allowed CPU Quota <br>(e.g. --cpus=1.5 -> 150ms CPU Time)"]
            SpikeUsage["Container Spikes <br>(Uses 150ms in first 30ms of window)"]
            RemainingTime["Remaining 70ms of the window"]
        end
        
        SpikeUsage -->|Quota Exhausted| Throttle[Kernel Suspends / Pauses Container]
        Throttle -->|Throttling Active| LatencySpike[High p99 Latency / Requests Delay]
        RemainingTime -->|Next Period Starts| Resume[Kernel Resumes Container]
    end

    style TotalQuota fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style SpikeUsage fill:#7c2d12,stroke:#f97316,color:#fff
    style Throttle fill:#7f1d1d,stroke:#ef4444,color:#fff
```

### ১. CPU Shares (`--cpu-shares`) - প্রোপরশনাল ওয়েইট:
- **মেকানিজম:** এটি সিপিইউ-এর কোনো হার্ড লিমিট সেট করে না। এটি একটি আপেক্ষিক অগ্রাধিকার (Priority Weight) স্কোর। হোস্টের সিপিইউ যদি অলস বা ফ্রী পড়ে থাকে, কন্টেইনারটি চাইলে ১০০% সিপিইউ ব্যবহার করতে পারবে।
- **CPU Congestion:** যখন হোস্টে সিপিইউ মেমরি নিয়ে যুদ্ধ শুরু হবে, তখন কার্নেল এই শেয়ার রেশিও অনুযায়ী সাইকেল ভাগ করে দেবে (যেমন: ১০২৪ বনাম ৫১২ শেয়ারের দুটি কন্টেইনার ২:১ অনুপাতে প্রসেসিং টাইম পাবে)।

### ২. CPU Quota (`--cpus`) - CFS শিডিউলারের হার্ড লিমিট:
- **মেকানিজম:** ডকার লিনাক্স কার্নেলের **Completely Fair Scheduler (CFS)** ব্যবহার করে নিখুঁত হার্ড লিমিট বসায়।
  - কার্নেল প্রতি ১০০ms (১০০,০০০us) উইন্ডোর একটি সময়কাল ট্র্যাক করে, যাকে **`cpu.cfs_period_us`** বলে।
  - আপনি যখন `--cpus=1.5` সেট করেন, ডকার কার্নেলে **`cpu.cfs_quota_us`** ভ্যালু ১৫০,০০০us (১৫০ms) সেট করে দেয়। অর্থাৎ প্রতি ১০০ms সময় জানালার মধ্যে কন্টেইনারের সমস্ত থ্রেড মিলে সর্বোচ্চ ১৫০ms সিপিইউ সাইকেল ব্যবহার করতে পারবে।
- **The Silent Killer: CPU Throttling (সিপিইউ থ্রটলিং):**
  - আপনার মাল্টি-থ্রেডেড গো বা জাভা অ্যাপ্লিকেশন যদি তীব্র রিকোয়েস্ট স্পাইক হ্যান্ডেল করতে গিয়ে উইন্ডোর প্রথম ৩০ms সময়ের মধ্যেই তার বরাদ্দকৃত ১৫০ms কোটা শেষ করে ফেলে, কার্নেলের CFS শিডিউলার তাৎক্ষণিকভাবে অ্যাপ্লিকেশন প্রসেসটিকে **স্থগিত বা সাসপেন্ড (Pause)** করে দেয়!
  - বাকি ৭০ms সময় অ্যাপ্লিকেশনটি সম্পূর্ণ ফ্রিজ হয়ে বসে থাকবে। একে বলে সিপিইউ থ্রটলিং। এর ফলে সিস্টেম ওভারঅল সিপিইউ ইউজ মাত্র ২০-৩০% দেখাবে, কিন্তু অ্যাপ্লিকেশনের রেসপন্স টাইম (p99 latency) হুট করে কয়েক সেকেন্ডে লাফিয়ে উঠবে!

#### থ্রটলিং চেক করার কমান্ড:
```bash
# কন্টেইনারের সিগ্রুপ ফাইলে গিয়ে থ্রটলিং কাউন্টার দেখা
cat /sys/fs/cgroup/cpu/cpu.stat
# nr_throttled কাউন্টার যদি অনবরত বাড়তে থাকে, তার মানে আপনার কন্টেইনার থ্রটল হচ্ছে!
```
**সমাধান:** হাই-পারফরম্যান্স এপিআই সার্ভারে সিপিইউ থ্রটলিং এড়াতে হার্ড লিমিট কিছুটা আলগা করে দেওয়া এবং কার্নেলের থ্রটল টিউনিং কনফিগার করা জরুরি।

---

## ২৭. BuildKit Build Cache & DAG Architecture (বিল্ডকিট এবং DAG শিডিউলার)

ডকারের ক্লাসিক বিল্ড প্রসেস ছিল অত্যন্ত লিনিয়ার এবং ধীরগতির (প্রতিটা লাইন ধরে ক্রমানুসারে চলা)। আধুনিক ডকার ইঞ্জিনে ব্যাকগ্রাউন্ডে ব্যবহৃত হয় অত্যন্ত শক্তিশালী এবং প্যারালাল এক্সিকিউশন সমৃদ্ধ বিল্ড ইঞ্জিন **BuildKit**।

```mermaid
flowchart TD
    subgraph BuildKitDAG [BuildKit Directed Acyclic Graph - DAG]
        direction LR
        Stage1["1. Install Base Packages <br>(Run Concurrently)"]
        Stage2["2. Build UI Frontend <br>(Run Concurrently)"]
        
        Merge["3. Compile Server Backend <br>(Depends on Stage 1 & 2)"]
        
        Stage1 --> Merge
        Stage2 --> Merge
    end

    style Stage1 fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Stage2 fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Merge fill:#065f46,stroke:#10b981,color:#fff
```

### ১. DAG (Directed Acyclic Graph) শিডিউলার:
BuildKit আপনার Dockerfile রিড করে তার সমস্ত বিল্ড স্টেজের ডিপেন্ডেন্সি অ্যানালাইসিস করে মেমরিতে একটি **Directed Acyclic Graph (DAG)** বা নির্দেশিত অ-চক্রীয় গ্রাফ তৈরি করে।
- **প্যারালাল এক্সিকিউশন:** মাল্টি-স্টেজ বিল্ডের ক্ষেত্রে, যদি `Staged Frontend Build` এবং `Staged Go Compiler Build` একে অপরের ওপর নির্ভরশীল না হয়, তবে BuildKit হোস্টের একাধিক সিপিইউ কোরে একই সাথে সমান্তরালভাবে দুটি বিল্ড স্টেজ রান করায়। ফলে বিল্ড টাইম প্রায় অর্ধেক হয়ে যায়!

### ২. Extremely Advanced Cache Mounting (`--mount=type=cache`)
আমাদের নোড (`npm install`), গো বা রাস্ট প্রজেক্ট বিল্ড করার সময় প্রতিবার সামান্য কোড চেঞ্জের কারণে সম্পূর্ণ ডিপেন্ডেন্সি রি-ডাউনলোড করতে বিশাল সময় নষ্ট হয়। BuildKit-এর চমৎকার একটি হিডেন ফিচার হলো **Cache Mounts**।

```dockerfile
# Dockerfile Advanced Standard
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# মেমরি ক্যাশ মাউন্ট সচল করা
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
RUN npm run build
```

#### এটি কীভাবে কাজ করে?
- ডকার হোস্ট মেশিনের একটি সুরক্ষিত মেমরি বা ডিরেক্টরিকে বিল্ড টাইমে সরাসরি `/root/.npm` পাথে ক্যাশ মাউন্ট হিসেবে যুক্ত করে দেয়।
- আপনি যখন পরবর্তী সময়ে নতুন কোনো প্যাকেজ অ্যাড করে বিল্ড করবেন, ডকার সম্পূর্ণ নতুন করে সব প্যাকেজ ডাউনলোড করবে না। সে ক্যাশ মাউন্টে থাকা হোস্টের মেমরি থেকে আগের প্যাকেজগুলো রিড করবে এবং কেবল নতুন প্যাকেজটি ডাউনলোড করবে। এটি বিল্ড টাইমকে প্রায় ৯০% কমিয়ে দিতে পারে!

---

## ২৮. Jailing Processes: pivot_root vs. chroot (ফাইলসিস্টেম আইসোলেশনের আসল রহস্য)

ডকার কীভাবে কন্টেইনারের ভেতরের প্রসেসকে এমনভাবে খাঁচাবন্দী (Jail) করে যে সে কোনো অবস্থাতেই হোস্ট ওএসের মূল রুট `/` ডিরেক্টরির বাইরে কোনো ফাইল দেখতে পারে না? 

অনেকে ভাবেন কন্টেইনারে ক্লাসিক লিনাক্স কমান্ড **`chroot` (Change Root)** ব্যবহার করা হয়। কিন্তু এ ধারণাটি সম্পূর্ণ ভুল এবং সিকিউরিটি পয়েন্ট থেকে বিপজ্জনক।

```mermaid
flowchart TD
    subgraph JailComparison ["Process Filesystem Jailing"]
        direction LR
        subgraph ChrootJail ["1. chroot (Insecure)"]
            chroot_in["Process Root changed <br>to /app/rootfs"]
            Escape["Root user can call <br>chroot() again and escape <br>using relative paths (../)"]
            chroot_in -->|Escape Possible| Escape
        end

        subgraph PivotRootJail ["2. pivot_root (Secure & Final)"]
            pivot_in["Swaps Mount Namespaces <br>RootFS becomes absolute /"]
            OldRoot["Old Host Root moved <br>to temp directory"]
            Unmount["Old Host Root is <br>completely unmounted"]
            
            pivot_in --> OldRoot --> Unmount
        end
    end

    style Escape fill:#7f1d1d,stroke:#ef4444,color:#fff
    style Unmount fill:#065f46,stroke:#10b981,color:#fff
```

### ১. কেন `chroot` ব্যবহার করা হয় না?
`chroot` কেবল একটি প্রসেসের ফাইল পাথ রেজোলিউশনের শুরুটা বদলে দেয়। যদি কন্টেইনারের ভেতর কোনো প্রসেস `root` প্রিভিলেজ পেয়ে যায়, সে খুব সহজে একটি ডাবল-ক্রুট সিকোয়েন্স এবং রিলেটিভ পাথ ব্যবহার করে ওএসের রুট বাউন্ডারি ভেঙে হোস্টের রুট ডিস্কে এস্কেপ (Escape) করতে পারে (এটি একটি বহু পরিচিত ক্লাসিক প্রিভিলেজ এস্কেপ ভলনারেবিলিটি)।

### ২. The Champion: `pivot_root` system call
ডকারের লো-লেভেল ওআইসি রানটাইম `runc` কন্টেইনার তৈরির সময় লিনাক্স কার্নেলের অত্যন্ত শক্তিশালী **`pivot_root`** সিস্টেম কল ট্রিগার করে।

- **মেকানিজম:** `pivot_root` প্রসেসের মাউন্ট নেমস্পেসের ভেতরে থাকা রুট মাউন্ট টেবিলটিকেই বদলে দেয়। সে কন্টেইনারের নতুন `rootfs` মাউন্টকে ওএসের একদম প্রাইমারি রুট `/` মাউন্টে রূপান্তর করে। 
- আর হোস্ট ওএসের পুরনো রুট মাউন্টকে একটি সাময়িক টেম্প ডিরেক্টরিতে সরিয়ে দেয়।
- এরপর `runc` ব্যাকগ্রাউন্ডে ওই টেম্প ডিরেক্টরিতে থাকা হোস্টের পুরনো রুট মাউন্ট পয়েন্টটি সম্পূর্ণ **`umount` (আনমাউন্ট)** করে মুছে দেয়।
- **The Defense:** যেহেতু কন্টেইনারের মাউন্ট টেবিলে হোস্টের রুট ফাইল সিস্টেমের কোনো চিহ্ন বা মাউন্ট পয়েন্টই অবশিষ্ট থাকে না, কন্টেইনার প্রসেস রুট ইউজার হলেও কোনো আপেক্ষিক পথ (`../`) ব্যবহার করে হোস্ট ওএসে ব্রেকআউট করার কোনো শারীরিক উপায় থাকে না। এটি ১০০% নিশ্ছিদ্র ফাইলসিস্টেম জেল নিরাপত্তা নিশ্চিত করে।

---

## ২৯. High-Performance IPC & Shared Memory Limits (`/dev/shm` & POSIX SHM)

উচ্চ পারফরম্যান্সের ব্যাকএন্ড আর্কিটেকচারে (যেমন: রিয়েল-টাইম ভিডিও ট্রান্সকোডার, হাই-ফ্রিকোয়েন্সি ট্রেডিং প্ল্যাটফর্ম, বা বড় পাইটর্চ/TensorFlow ডিওআইপি মডেল) মাইক্রোসার্ভিসগুলোর মধ্যে সাধারণ HTTP বা TCP/IP নেটওয়ার্ক সকেট দিয়ে ডাটা পাস করা অত্যন্ত ধীরগতির ও ব্যয়বহুল। 

এসব ক্ষেত্রে প্রসেসগুলোর মধ্যে ডাটা শেয়ার করতে **Shared Memory (শেয়ার্ড মেমরি)** বা **POSIX IPC** ব্যবহার করা হয়।

```mermaid
flowchart LR
    subgraph IPCSharedMem [Shared Memory - Zero Latency]
        ProcessA[Container Process A]
        ProcessB[Container Process B]
        
        RAM_Block["Shared Physical RAM Block <br>(Mapped inside both Address Spaces)"]
        
        ProcessA -->|Writes instantly <br>Zero Copy / Zero Latency| RAM_Block
        ProcessB -->|Reads instantly <br>Zero Copy / Zero Latency| RAM_Block
    end

    style RAM_Block fill:#065f46,stroke:#10b981,color:#fff
```

### POSIX Shared Memory কী?
এটি লিনাক্স মেমরি ম্যানেজমেন্টের এমন একটি ফিচার যা একই ফিজিক্যাল র‍্যাম ব্লককে দুটি সম্পূর্ণ ভিন্ন প্রসেসের ভার্চুয়াল অ্যাড্রেস স্পেসে ম্যাপ করে দেয়। ফলে প্রসেস A মেমরিতে ডেটা রাইট করামাত্রই প্রসেস B কোনো নেটওয়ার্ক বা ফাইল রাইট ল্যাটেন্সি ছাড়াই তা জিরো-কপি (Zero-Copy) মেকানিজমে দেখতে পায়।

### The /dev/shm Limit Trap (একটি কমন প্রোডাকশন ক্র্যাশ)
লিনাক্সে শেয়ার্ড মেমরি মাউন্ট পয়েন্ট থাকে `/dev/shm` ডিরেক্টরিতে। 
- **The Trap:** ডকার ডিফল্ট অবস্থায় প্রতিটা কন্টেইনারের জন্য এই শেয়ার্ড মেমরি বা `/dev/shm` সাইজ মাত্র **64MB**-তে লিমিট করে দেয়!
- আপনি যখন কোনো কন্টেইনারে পাইটর্চ (PyTorch) ট্রেনিং রান করবেন বা হেডলেস ক্রোম (Headless Chrome) স্ক্র্যাপার চালাবেন, এটি লার্জ ডেটা মেমরিতে লোড করতে গিয়ে ৬৪MB কোটা পার হওয়ামাত্রই **`SIGBUS` (Bus Error)** খেয়ে সাথে সাথে ক্র্যাশ করে বন্ধ হয়ে যাবে।

### সিনিয়র আর্কিটেক্ট সলিউশন:

এই মেমরি বিপর্যয় এড়াতে কন্টেইনার রান করার সময় নিচের এডভান্সড শেয়ারিং টিউনিং কনফিগার করতে হয়:

```bash
# কন্টেইনারের শেয়ার্ড মেমরি সাইজ বাড়িয়ে ২ গিগাবাইট করা
docker run -d --shm-size=2g my-pytorch-app
```

#### কন্টেইনার টু কন্টেইনার শেয়ার্ড মেমরি:
আপনি যদি চান দুটি সম্পূর্ণ ভিন্ন কন্টেইনারের প্রসেস একে অপরের সাথে মেমরি শেয়ার করে জিরো-ল্যাটেন্সিতে কথা বলবে, তবে তাদের শেয়ার্ড মেমরি আইসোলেশন রিডাইরেক্ট করে দিতে পারেন:
```bash
# কন্টেইনার A স্পন করে তার মেমরি শেয়ারেবল ঘোষণা করা
docker run -d --name container-a --ipc=shareable my-high-speed-writer

# কন্টেইনার B রান করে সরাসরি কন্টেইনার A-এর মেমরিতে জয়েন করা
docker run -d --name container-b --ipc=container:container-a my-high-speed-reader
```

---

## ৩০. cgroups PID Controller & Fork Bomb Protection (ফর্ক বোম প্রটেকশন)

কন্টেইনারের ভেতরের প্রসেস লিমিটেশন না করলে হ্যাকাররা ওএসের মেমরি বা সিপিইউ শেষ না করেই আপনার সম্পূর্ণ সার্ভার লক বা ক্র্যাশ করে দিতে পারে—যার অন্যতম হাতিয়ার হলো **Fork Bomb (ফর্ক বোম)**। লিনাক্স কার্নেলের **cgroups PID Controller** আমাদের এই বিপর্যয় থেকে ১০০% সুরক্ষা দেয়।

```mermaid
flowchart TD
    subgraph ForkBombAttack [Fork Bomb Attack Prevention]
        direction TB
        Attacker[Remote Code Execution RCE] -->|Triggers Fork Bomb| Loop[":(){ :|:& };: <br>Infinite Process Creation"]
        
        subgraph CGroup_PIDs [CGroups PID Controller Enforced]
            PID_Limit["PID Limit: --pids-limit=100 <br>(pids.max in cgroups v2)"]
        end
        
        Loop -->|Spawns Threads| CGroup_PIDs
        CGroup_PIDs -->|Hits 100 limit| Blocks["Kernel blocks further fork() <br>Host remains 100% stable"]
        CGroup_PIDs -.->|No limit set| Exhaustion["Host process table exhausted <br>Server locks up / restarts"]
    end

    style PID_Limit fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Blocks fill:#065f46,stroke:#10b981,color:#fff
    style Exhaustion fill:#7f1d1d,stroke:#ef4444,color:#fff
```

### ১. ফর্ক বোম কী?
ফর্ক বোম হলো এমন একটি স্ক্রিপ্ট বা প্রসেস যা লুপ আকারে অনবরত নিজের চাইল্ড প্রসেস তৈরি করতে থাকে (যেমন লিনাক্স শেলের কুখ্যাত কোড: `:(){ :|:& };:`)। 
- হোস্টে যদি কোনো লিমিটেশন না থাকে, তবে এই প্রসেসগুলো কয়েক সেকেন্ডের মধ্যে ওএসের সম্পূর্ণ প্রসেস টেবিল ফুল করে ফেলে। এর ফলে রিয়েল হোস্ট সার্ভারটি হ্যাং হয়ে যায় এবং সিস্টেম রিস্টার্ট করা ছাড়া আর কোনো উপায় থাকে না।

### ২. cgroups `pids.max` সমাধান
ডকার কন্টেইনারে আমরা সিগ্রুপের সাহায্যে খুব সহজে সর্বোচ্চ প্রসেস ও থ্রেড সংখ্যা লিমিট করে দিতে পারি:
```bash
# কন্টেইনারে সর্বোচ্চ ১০০টির বেশি প্রসেস বা থ্রেড তৈরি করা যাবে না
docker run -d --pids-limit=100 my-app
```
#### ইন্টারনাল মেকানিজম:
- ডকার কার্নেলের cgroups v2 ডিরেক্টরিতে কন্টেইনারের জন্য **`pids.max`** ফাইলে `100` ভ্যালুটি রাইট করে দেয়।
- এখন যদি অ্যাপ্লিকেশনে আরসিই (Remote Code Execution) ঘটিয়ে হ্যাকার ফর্ক বোম ট্রিগার করে, তবে কার্নেল ১০০টি প্রসেস তৈরি হওয়ার পর পরবর্তী সমস্ত `fork()` সিস্টেম কল ব্লক করে দেবে। কন্টেইনারের ভেতরের প্রসেসগুলো ক্র্যাশ করবে, কিন্তু হোস্ট ওএস বা অন্য কন্টেইনারগুলো সম্পূর্ণ অক্ষত ও ১০০% সচল থাকবে।

---

## ৩১. Read-Only Page Cache Sharing & RAM De-duplication (পেজ ক্যাশ শেয়ারিং)

একটি হোস্ট ওএসে একই সাথে ১,০০০টি ডকার কন্টেইনার রান করলেও হোস্টের র‍্যাম কীভাবে খালি থাকে? কেন প্রতিটা কন্টেইনারের ওএস ও লাইব্রেরি ফাইলের জন্য আলাদা করে মেমরি খরচ হয় না?

এর রহস্য হলো লিনাক্স কার্নেলের **Page Cache Sharing** এবং **Memory De-duplication**।

```mermaid
flowchart TD
    subgraph RAM_DeDuplication [Page Cache RAM De-duplication]
        direction TB
        subgraph PhysicalRAM [Host Physical RAM]
            SharedCache["Shared Read-Only Page Cache <br>(Alpine Base Image - 5MB loaded once)"]
        end
        
        Cont1[Container Process 1] -->|Reads /bin/sh| SharedCache
        Cont2[Container Process 2] -->|Reads /bin/sh| SharedCache
        Cont3[Container Process 3] -->|Reads /bin/sh| SharedCache
        
        subgraph PrivateRAM [Private RAM Allocated]
            Cont1_Write["Container 1 Modifies File <br>(Copy-on-Write RAM Page)"]
        end
        
        Cont1 -->|Writes /etc/conf| Cont1_Write
    end

    style SharedCache fill:#065f46,stroke:#10b981,color:#fff
    style Cont1_Write fill:#7c2d12,stroke:#f97316,color:#fff
```

### কীভাবে পেজ ক্যাশ মেমরি অপ্টিমাইজ করে?
ডকার কন্টেইনারের সমস্ত বেস ইমেজ লেয়ার রিড-অনলি (Read-Only) ফাইল হিসেবে হোস্টের `/var/lib/docker/overlay2/` ডিরেক্টরিতে সংরক্ষিত থাকে।

1. **Loaded Once:** যখন প্রথম কন্টেইনারটি রান হয়, কার্নেল তার রিড-অনলি ফাইলগুলোকে (যেমন: `/bin/sh` বা শেয়ার্ড লাইব্রেরি `.so` ফাইল) হোস্টের ফিজিক্যাল র‍্যামের **Page Cache**-এ লোড করে।
2. **De-duplicated Access:** এরপর যখন আরও ৯৯৯টি কন্টেইনার একই ইমেজ থেকে একই ফাইলগুলো রিড করতে চায়, লিনাক্স কার্নেল তাদের জন্য মেমরিতে নতুন কোনো স্পেস বরাদ্দ করে না। তারা সবাই সরাসরি হোস্ট ওএসের মেমরিতে থাকা ওই একই **Shared Page Cache** থেকে ফাইলগুলো এক্সেস করে।
3. **Copy-on-Write:** যদি কোনো কন্টেইনার তার নিজস্ব কোনো ফাইলে রাইট করার চেষ্টা করে, কার্নেল মেমরিতে কেবল ওই নির্দিষ্ট পেজটির একটি ক্লোন কপি তৈরি করে কন্টেইনারের প্রাইভেট মেমরিতে লেখে। 
- এই বৈপ্লবিক মেমরি শেয়ারিং মেকানিজমের কারণেই ডকার কন্টেইনার ভার্চুয়াল মেশিনের তুলনায় মেমরি ও রিসোর্সের দিক থেকে শতগুণ বেশি দক্ষ ও সাশ্রয়ী।

---

## ৩২. Enterprise Virtual Networking: MACVLAN vs. IPVLAN

হাই-পারফরম্যান্স বেয়ার-মেটাল ডেটা সেন্টার বা টেলিকমিউনিকেশন অ্যাপ্লিকেশনে ডকারের ডিফল্ট ব্রিজ নেটওয়ার্ক (`docker0`) একটি বড় পারফরম্যান্স বটলেনেক তৈরি করতে পারে। আইপিটেবিলস (iptables), নেট (NAT) এবং ওএস কনটেক্সট সুইচিং এড়াতে এন্টারপ্রাইজ লেভেলে ফিজিক্যাল সুইচের সাথে সরাসরি কন্টেইনার সংযোগ করতে **MACVLAN** এবং **IPVLAN** ড্রাইভার ব্যবহৃত হয়।

```mermaid
flowchart TD
    subgraph NetVirtualization [MACVLAN vs. IPVLAN Networking]
        direction LR
        subgraph MACVLAN_Mode ["1. MACVLAN (Unique MACs)"]
            ContA["Container A <br>IP: 192.168.1.50 <br>MAC: AA:BB:CC:01"]
            ContB["Container B <br>IP: 192.168.1.51 <br>MAC: AA:BB:CC:02"]
        end

        subgraph IPVLAN_Mode ["2. IPVLAN (Shared MAC)"]
            ContC["Container C <br>IP: 192.168.1.60 <br>MAC: Host MAC"]
            ContD["Container D <br>IP: 192.168.1.61 <br>MAC: Host MAC"]
        end
        
        PhysSwitch["Physical Switch / Router <br>(Direct Connection)"]
        
        MACVLAN_Mode --->|Individual MAC packets| PhysSwitch
        IPVLAN_Mode --->|Single MAC packets| PhysSwitch
    end

    style PhysSwitch fill:#065f46,stroke:#10b981,color:#fff
```

### ১. MACVLAN ড্রাইভার:
- **মেকানিজম:** MACVLAN ড্রাইভার হোস্টের ফিজিক্যাল নেটওয়ার্ক ইন্টারফেসকে (যেমন: `eth0`) সাব-ইন্টারফেসে বিভক্ত করে প্রতিটা কন্টেইনারকে একটি সম্পূর্ণ ইউনিক ভার্চুয়াল **MAC Address** এবং নিজস্ব সাবনেট থেকে রিয়েল আইপি বরাদ্দ করে।
- **পারফরম্যান্স:** এটি ডকার ব্রিজ এবং ওএস ন্যাটিং (NAT) কে সম্পূর্ণ বাইপাস করে সরাসরি ফিজিক্যাল সুইচে ট্রাফিক পাঠায়, যা কন্টেইনারকে ফিজিক্যাল তারের সমান (Wire-speed) স্পিড এনে দেয়।
- **সীমাবদ্ধতা:** আপনার ফিজিক্যাল নেটওয়ার্ক কার্ডে হাজার হাজার MAC এড্রেস হ্যান্ডেল করার মেমরি লিমিটেশন (MAC table overflow) হতে পারে। এছাড়া ক্লাউড এনভায়রনমেন্ট (যেমন AWS বা Azure)-এর সিকিউরিটি পলিসি অচেনা ম্যাক অ্যাড্রেসের প্যাকেটগুলো ড্রপ করে দেয়।

### ২. IPVLAN ড্রাইভার (L2 এবং L3 মোড):
- **মেকানিজম:** IPVLAN ড্রাইভার অনেকটা MACVLAN-এর মতোই কাজ করে, তবে এখানে সমস্ত কন্টেইনার হোস্টের ফিজিক্যাল নেটওয়ার্ক কার্ডের **একই MAC Address শেয়ার করে**। তারা কেবল আলাদা আলাদা আইপি এড্রেস ব্যবহার করে।
- **সুবিধা:** যেহেতু ফিজিক্যাল সুইচের কাছে মাত্র একটিই ম্যাক অ্যাড্রেস দৃশ্যমান থাকে, এটি ম্যাক টেবিল ওভারফ্লো এড়ায় এবং ক্লাউড প্রোভাইডারদের সিস্টেমে কোনো প্যাকেট ড্রপ ছাড়াই চমৎকারভাবে কাজ করে।

---

## ৩৩. UTS Namespace: Hostname & Domain Isolation (ইউটিএস নেমস্পেস)

ডকারের অন্যতম লাইটওয়েট কিন্তু অত্যন্ত গুরুত্বপূর্ণ নেমস্পেস হলো **UTS (UNIX Timesharing System) Namespace**। 

```mermaid
flowchart LR
    subgraph UTSNamespace [UTS Namespace Hostname Isolation]
        HostOS["Host Operating System <br>Hostname: production-node-1"]
        
        subgraph ContainerUTS ["UTS Namespace (CLONE_NEWUTS)"]
            ContProc["Container Process <br>Hostname: api-service-container"]
        end
        
        ContProc -->|Runs 'hostname db-server'| ContainerUTS
        ContainerUTS -.->|Isolation Wall| HostOS
    end

    style HostOS fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style ContainerUTS fill:#065f46,stroke:#10b981,color:#fff
```

### UTS নেমস্পেস কী আইসোলেট করে?
UTS নেমস্পেস ওএসের **Hostname** এবং **Domain Name** আইসোলেট বা পৃথক করে।

- **কার্নেল ফ্ল্যাগ:** ডকার যখন কন্টেইনার ক্রিয়েট করে, সে কার্নেলে `CLONE_NEWUTS` সিস্টেম ফ্ল্যাগটি পাস করে।
- **নিরাপত্তা:** কন্টেইনারের ভেতরের কোনো প্রসেস যদি রুট প্রিভিলেজ নিয়ে হোস্টনেম পরিবর্তন করার চেষ্টা করে (যেমন: `hostname new-name`), তবে তা কেবল ওই কন্টেইনারের ভেতরের আইসোলেটেড বাউন্ডারিতেই পরিবর্তিত হবে। হোস্ট ওএসের বা অন্য কোনো রানিং কন্টেইনারের হোস্টনেমের ওপর এর বিন্দুমাত্র কোনো প্রভাব পড়বে না।

---

## ৩৪. Real-World Case Study: Production-Grade Full-Stack Microservices Architecture

আমরা এ পর্যন্ত যা কিছু শিখেছি—Namespaces, cgroups v2, Multi-stage Builds, Security Hardening, non-root users, Healthchecks, এবং POSIX Shared Memory—সেগুলোর সবকটি রিয়েল-ওয়ার্ল্ড প্রজেক্টে বাস্তবায়ন করার জন্য এটি একটি চূড়ান্ত কেস স্টাডি। 

এখানে আমরা একটি জটিল **Full-Stack SaaS Application** আর্কিটেকচার তৈরি করব যেখানে থাকবে:
1. **Frontend:** Next.js (Redux সহ)
2. **Backend:** NestJS (Node.js framework)
3. **Database:** PostgreSQL (ডাটা পারসিস্টেন্স)
4. **Cache/Queue:** Redis (সেশন ও ব্যাকগ্রাউন্ড কাজ)
5. **Gateway / Reverse Proxy:** Nginx (লোড ব্যালেন্সিং ও এপিআই গেটওয়ে)
6. **Payment System:** Stripe API (এক্সটার্নাল গেটওয়ে)

```mermaid
flowchart TD
    subgraph PublicSpace [Public Web / Client]
        User["Client Browser <br>(Next.js App with Redux)"]
    end

    subgraph ContainerPrivateNetwork [Internal Secure Network - 172.20.0.0/16]
        NginxGateway["Nginx Reverse Proxy <br>(Port 80/443 Gateway)"]
        
        NextFront["Next.js SSR Container <br>(Port 3000 - Non-root)"]
        NestBack["NestJS API Container <br>(Port 4000 - Non-root)"]
        
        PostgresDB["PostgreSQL Database <br>(Port 5432 - Volume Mounted)"]
        RedisCache["Redis Cache / Queue <br>(Port 6379)"]
    end

    subgraph ExternalAPI [External Cloud APIs]
        Stripe["Stripe Payment Gateway"]
    end

    User --->|HTTP Requests| NginxGateway
    
    NginxGateway --->|Proxy /| NextFront
    NginxGateway --->|Proxy /api| NestBack
    
    NestBack --->|Query & Persist| PostgresDB
    NestBack --->|Cache & Queue| RedisCache
    NestBack --->|HTTPS API Call| Stripe

    style NginxGateway fill:#065f46,stroke:#10b981,color:#fff
    style PostgresDB fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style RedisCache fill:#7c2d12,stroke:#f97316,color:#fff
    style Stripe fill:#7f1d1d,stroke:#ef4444,color:#fff
```

---

### ১. Next.js Frontend Dockerfile (Production-Grade, Multi-Stage, Under 100MB)

এই Dockerfile-এ আমরা BuildKit মেমরি মাউন্ট ক্যাশ, মাল্টি-স্টেজ এবং সিকিউর `nextjs` ইউজার ব্যবহার করেছি, যা ইমেজের সাইজ ১ গিগাবাইট থেকে মাত্র ৯০ মেগাবাইটে নামিয়ে আনবে।

```dockerfile
# ==========================================
# STAGE 1: Dependency Installer (Caching)
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.json এবং lockfile কপি করা
COPY package.json package-lock.json ./

# BuildKit npm ক্যাশ মাউন্ট সচল করে ডিপেন্ডেন্সি ইনস্টল করা
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ==========================================
# STAGE 2: Source Code Builder (DAG Parallel)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js টেলিমোট্রি অফ করে প্রোডাকশন বিল্ড দেওয়া
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ==========================================
# STAGE 3: Minimal Production Runner (Hardened)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# লিনাক্স গ্রুপ ও নন-রুট সিস্টেম ইউজার তৈরি
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# বিল্ড আউটপুট শুধু রানার স্টেজে কপি করা (Minimize Image Size)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# নন-রুট ইউজার এক্টিভেট করা (Host Root Protections)
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

### ২. NestJS Backend Dockerfile (Multi-stage, Typescript Optimized)

NestJS ব্যাকএন্ডের জন্য সোর্স কোড কম্পাইল করতে TypeScript কম্পাইলার প্রয়োজন হয়, যা প্রোডাকশনে কোনো কাজে আসে না। তাই আমরা ডেভ-ডিপেন্ডেন্সি প্রুন (prune) করে নিরেট জাভাস্ক্রিপ্ট রানার ইমেজ বানাব।

```dockerfile
# ==========================================
# STAGE 1: Compile TypeScript Source Code
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

# ডেভ ডিপেন্ডেন্সি বাদ দিয়ে শুধু প্রোডাকশন লাইব্রেরি রাখা
RUN npm prune --production

# ==========================================
# STAGE 2: Ultra-light Runner Image
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# ওএস সিকিউরিটি এনশিওর করা
RUN apk add --no-cache openssl

# নন-রুট সিকিউর রানার ইউজার
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /usr/src/app/dist ./dist

USER appuser

EXPOSE 4000
ENV PORT 4000
ENV NODE_ENV production

# ওএম কিলার প্রোটেকশন হেলথচেক
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/main.js"]
```

---

### ৩. Nginx Gateway Config (`nginx.conf`)

Nginx আমাদের এপিআই গেটওয়ে হিসেবে কাজ করবে, যা ক্লায়েন্ট থেকে আসা পোর্ট ৮০-র রিকোয়েস্টগুলোকে নেমস্পেস রাউটিংয়ের মাধ্যমে ডকার নেটওয়ার্কে পাঠাবে।

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # সিকিউরিটি হেডারস (Hardening)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # রিকোয়েস্ট রেট লিমিটিং (DDoS প্রতিরোধ)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    upstream frontend {
        server nextjs-web:3000;
    }

    upstream backend {
        server nestjs-api:4000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend SSR Routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Backend API Routes with Rate Limiting
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

### ৪. Docker Compose File (`docker-compose.yml` for Local Development)

ডেভেলপমেন্ট এনভায়রনমেন্টে হট-রিলোড, ভলিউম পারসিস্টেন্স এবং হেলথচেক নিশ্চিত করতে এই ডকার কম্পোজ ফাইলটি ডিজাইন করা হয়েছে।

```yaml
version: '3.8'

networks:
  saas-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

services:
  # ----------------------------------------
  # 1. Reverse Proxy Gateway
  # ----------------------------------------
  nginx-gateway:
    image: nginx:alpine
    container_name: nginx_gateway
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - nextjs-web
      - nestjs-api
    networks:
      - saas-network
    restart: always

  # ----------------------------------------
  # 2. Next.js Frontend (Live Reload Mount)
  # ----------------------------------------
  nextjs-web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: nextjs_frontend
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost/api
    volumes:
      - ./frontend:/app
      - /app/node_modules # Anonymous volume to lock node_modules
    networks:
      - saas-network
    restart: unless-stopped

  # ----------------------------------------
  # 3. NestJS Backend (Live Reload Mount)
  # ----------------------------------------
  nestjs-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nestjs_backend
    environment:
      - NODE_ENV=development
      - PORT=4000
      - DATABASE_URL=postgresql://postgres:secure_db_pass@postgres-db:5432/saas_db
      - REDIS_URL=redis://redis-cache:6379
      - STRIPE_SECRET_KEY=sk_test_51MockStripeKey
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      postgres-db:
        condition: service_healthy # Wait for database check before boot
    networks:
      - saas-network
    restart: unless-stopped

  # ----------------------------------------
  # 4. PostgreSQL Database (Data Persistence)
  # ----------------------------------------
  postgres-db:
    image: postgres:16-alpine
    container_name: postgres_db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secure_db_pass
      - POSTGRES_DB=saas_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d saas_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - saas-network
    # cgroups v2 resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  # ----------------------------------------
  # 5. Redis Cache / Message Queue
  # ----------------------------------------
  redis-cache:
    image: redis:7-alpine
    container_name: redis_cache
    volumes:
      - redis_data:/data
    networks:
      - saas-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

---

### ৫. Kubernetes Pod / Deployment Specification (`k8s-deployment.yaml`)

বাস্তব ক্লাউড প্রোডাকশনে কন্টেইনার সার্ভিসগুলোকে অটো-স্কেলিং, নিশ্ছিদ্র সিকিউরিটি এবং জিরো-ডাউনটাইম নিশ্চিত করতে কুবারনেটিস কনফিগারেশন এভাবে লিখতে হয়।

এখানে আমরা **cgroups limit (resources)**, **SecurityContext (readOnlyRoot, Capabilities Drop)**, এবং **Liveness/Readiness Probes** যুক্ত করেছি।

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-api-deployment
  labels:
    app: nestjs-api
spec:
  replicas: 3 # 3 Pods running concurrently for High Availability
  selector:
    matchLabels:
      app: nestjs-api
  template:
    metadata:
      labels:
        app: nestjs-api
    spec:
      containers:
      - name: nestjs-api-container
        image: myregistry.com/saas-backend:v1.0
        ports:
        - containerPort: 4000
        
        # ------------------------------------------
        # SECURITY HARDENING: SecurityContext
        # ------------------------------------------
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
          readOnlyRootFilesystem: true # Prevent hackers writing exploits
          capabilities:
            drop:
            - ALL # Drop all Linux capabilities
            
        # ------------------------------------------
        # HEALTHCHECKS: Liveness & Readiness Probes
        # ------------------------------------------
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 10
          
        # ------------------------------------------
        # RESOURCE CONTROL: cgroups Enforcements
        # ------------------------------------------
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi" # oom_score_adj limits
            cpu: "500m" # cfs CPU bandwidth limits
            
        # ------------------------------------------
        # SECRETS MANAGEMENT
        # ------------------------------------------
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: database-url
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: stripe-secrets
              key: api-key
```

---

### ৬. Core Docker & Orchestration Commands for the Cluster (সার্ভিস ব্যবস্থাপনার কমান্ড গাইড)

এই কন্টেইনারাইজড অ্যাপ্লিকেশন ক্লাস্টারটি লোকাল এবং কুবারনেটিস ক্লাউড ওএসে রান, ডিবাগ, ডাটাবেস মাইগ্রেশন এবং মনিটর করার জন্য সমস্ত প্রয়োজনীয় কমান্ড নিচে দেওয়া হলো:

```mermaid
flowchart TD
    subgraph CommandsGuide [Stack Operation Lifecycle]
        direction LR
        Build["1. Build & Up <br>docker compose up --build -d"]
        Migrate["2. DB Migration <br>docker compose exec nestjs-api ..."]
        Debug["3. Live Diagnostics <br>docker stats / logs"]
        Deploy["4. Cloud Production <br>kubectl apply -f ..."]
        
        Build --> Migrate --> Debug --> Deploy
    end
```

#### ১. লোকাল ডেভেলপমেন্ট স্ট্যাক চালানো (Docker Compose)
* **BuildKit সচল করে সম্পূর্ণ প্রজেক্ট বিল্ড ও রান করা:**
  ```bash
  # ব্যাকগ্রাউন্ডে কন্টেইনার ক্লাস্টার চালু করার জন্য
  DOCKER_BUILDKIT=1 docker compose up --build -d
  ```
* **লাইভ লগ দেখা (Real-time Logs):**
  ```bash
  # সব কন্টেইনারের লগ একসাথে দেখতে
  docker compose logs -f
  
  # শুধুমাত্র NestJS ব্যাকএন্ড কন্টেইনারের লগ দেখতে
  docker compose logs -f nestjs-api
  ```
* **জিরো-ডাউনটাইমে একটি নির্দিষ্ট সার্ভিস রিবিল্ড করা:**
  ```bash
  # অন্য সার্ভিস সচল রেখে শুধু NestJS ব্যাকএন্ড রিবিল্ড করা
  docker compose up -d --no-deps --build nestjs-api
  ```
* **কন্টেইনার ক্লাস্টার সম্পূর্ণ স্টপ ও ক্লিন করা:**
  ```bash
  # কন্টেইনার স্টপ এবং তৈরি করা সমস্ত ভলিউম সহ ডেটা ডিলিট করতে
  docker compose down -v
  ```

#### ২. ডিবাগিং এবং গভীর ডায়াগনস্টিকস
* **চলতি কন্টেইনারের শেলের (bash/sh) ভেতর ঢোকা:**
  ```bash
  # NestJS কন্টেইনারে অ্যাক্সেস করে ইন্টারনাল ফাইলসিস্টেম চেক করা
  docker compose exec nestjs-api sh
  ```
* **কন্টেইনারগুলোর মেমরি ও সিপিইউ রিয়েল-টাইমে মনিটর করা (cgroups inspect):**
  ```bash
  # কোন কন্টেইনার কত মেমরি ও সিপিইউ খাচ্ছে তা দেখতে
  docker stats
  ```
* **ডকার নেটওয়ার্ক ও কন্টেইনার আইপি এড্রেসসমূহ চেক করা:**
  ```bash
  # আমাদের তৈরি 'saas-network' সাবনেট ও তার কানেক্টেড কন্টেইনার আইপি দেখতে
  docker network inspect my-doc-site_saas-network
  ```
* **কন্টেইনারের মেমরি হেলথ স্ট্যাটাস দেখা (Healthcheck Status):**
  ```bash
  # কন্টেইনারের হেলথ চেক রেজাল্ট JSON ফরম্যাটে দেখতে
  docker inspect --format='{{json .State.Health}}' nestjs_backend
  ```

#### ৩. ডাটাবেস মাইগ্রেশন ও ডাটা অ্যাক্সেস কমান্ড
* **কন্টেইনারের ভেতর থেকে ডাটাবেস মাইগ্রেশন রান করা:**
  ```bash
  # NestJS কন্টেইনারের ভেতর দিয়ে Prisma/TypeORM মাইগ্রেশন চালানো
  docker compose exec nestjs-api npm run db:migrate
  ```
* **সরাসরি PostgreSQL ডাটাবেস শেলে অ্যাক্সেস করা:**
  ```bash
  # কন্টেইনারের রানিং Postgres ক্লায়েন্টে ঢোকা
  docker compose exec postgres-db psql -U postgres -d saas_db
  ```
* **Redis লাইভ কানেকশন ও ক্যাশ টেস্টিং:**
  ```bash
  # Redis কন্টেইনারে পিং করে রেসপন্স চেক করা
  docker compose exec redis-cache redis-cli ping
  ```

#### ৪. ক্লাউড প্রোডাকশন কমান্ডস (Kubernetes Orchestration)
* **কুবারনেটিসের জন্য সিকিউর সিক্রেট তৈরি করা:**
  ```bash
  # ডাটাবেস ও স্ট্রাইপ এপিআই কি ক্রিপ্টোগ্রাফিক সিক্রেট হিসেবে হোস্ট করা
  kubectl create secret generic db-credentials --from-literal=database-url="postgresql://..."
  kubectl create secret generic stripe-secrets --from-literal=api-key="sk_test_..."
  ```
* **কুবারনেটিসে সার্ভিসগুলো ডেপ্লয় করা:**
  ```bash
  # সম্পূর্ণ ডিপ্লয়মেন্ট কুবারনেটিস ক্লাস্টারে সাবমিট করা
  kubectl apply -f k8s-deployment.yaml
  ```
* **পড ও মেমরি স্ট্যাটাস পর্যবেক্ষণ করা:**
  ```bash
  # রানিং পড ও তাদের রেপ্লিকা স্ট্যাটাস দেখতে
  kubectl get pods -o wide
  
  # কন্টেইনার বুট হতে কোনো এরর খেলে তার ডিটেইলস জানা
  kubectl describe deployment nestjs-api-deployment
  ```
* **কুবারনেটিসে লাইভ কন্টেইনার লগ মনিটর করা:**
  ```bash
  # ডিপ্লয়মেন্টের লাইভ লগ ট্র্যাকিং
  kubectl logs -f deployment/nestjs-api-deployment
  ```
* **চলতি কুবারনেটিস পডের ভেতরে সরাসরি কমান্ড চালানো:**
  ```bash
  # কুবারনেটিস কন্টেইনারের ভেতরে ইন্টারঅ্যাক্টিভ শেল ওপেন করা
  kubectl exec -it <pod_name> -- sh
  ```

---

### ৭. Production-Grade .dockerignore Configurations (সিকিউর ফাইল ইগনোর পলিসি)

প্রোডাকশন-গ্রেড ডকারাইজেশনে **`.dockerignore`** ফাইল কনফিগার করা কেবল ফাইল অপ্টিমাইজেশন নয়, এটি একটি অত্যন্ত গুরুত্বপূর্ণ সিকিউরিটি এবং বিল্ড-স্ট্যাবিলিটি প্র্যাকটিস।

```mermaid
flowchart TD
    subgraph DockerIgnoreShield [Build Context Filtering with .dockerignore]
        HostFiles["Host Filesystem <br>(Code, Secrets, node_modules)"]
        DockerDaemon["Docker Daemon Build Context"]
        
        HostFiles --->|1. Filters via .dockerignore| Filter["Filters Out: <br>- node_modules <br>- .env secrets <br>- Build artifacts .next/dist"]
        Filter --->|2. Light-weight context sent| DockerDaemon
    end
```

#### কেন `.dockerignore` ছাড়া কন্টেইনার ফেইল করে?
1. **Binary Architecture Mismatch (ELF Class Mismatch):** আপনি যদি আপনার লোকাল উইন্ডোজ বা ম্যাকওএস মেশিনে `npm install` দিয়ে কন্টেইনার বিল্ড করার সময় `.dockerignore` ব্যবহার না করেন, তবে লোকাল মেশিনের **`node_modules`** সরাসরি কন্টেইনারে কপি হয়ে যাবে। যেহেতু কন্টেইনারটি লিনাক্স আলপাইন (Linux Alpine) ওএসে চলে, সেখানকার বাইনারি আর্কিটেকচার লোকাল ম্যাক/উইন্ডোজের সাথে মিলবে না। এর ফলে কন্টেইনারটি রান করার সাথে সাথে প্রসেসটি ক্র্যাশ করবে এবং ওএসে কুখ্যাত `Cannot find module` অথবা `Wrong ELF class` এরর দেখাবে।
2. **Secrets Leakage:** `.env` বা লোকাল কি-স্টোর ফাইলগুলো ইগনোর না করলে তা ইমেজের লেয়ারে বিল্ড হয়ে যাবে এবং হ্যাকাররা ডকার হাব থেকে আপনার ইমেজটি পুল করে খুব সহজে আপনার ডাটাবেস পাসওয়ার্ড বা এপিআই কি বের করে নিতে পারবে।
3. **Build Latency:** গিগাবাইট সাইজের `node_modules` ডকার ডেমনে সেন্ড হতে অনেক লম্বা সময় নিবে এবং আপনার পাইপলাইন ড্র্যাগ করবে।

#### ক. Next.js Frontend `.dockerignore` (`/frontend/.dockerignore`):
```text
# Dependency folders
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js Build Outputs (Huge Size)
.next/
out/
build/

# IDEs & System files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
Thumbs.db

# Secrets & Environment variables (Critical Security)
.env
.env.local
.env.production
.env.development
.env.test
.env*.local

# Version Control
.git
.gitignore
.github
```

#### খ. NestJS Backend `.dockerignore` (`/backend/.dockerignore`):
```text
# Local Dependencies
node_modules/

# TypeScript build outputs
dist/
build/

# Debug and Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.logs/
*.log

# Environment Files
.env
.env.production
.env.development
.env.local

# OS and Editors
.DS_Store
.idea/
.vscode/

# Git metadata
.git
.gitignore
```

---

### ৮. Production-Grade Docker Secrets & Environment Security (ডকার সিক্রেটস ও এনভায়রনমেন্ট নিরাপত্তা)

রিয়েল-ওয়ার্ল্ড প্রোডাকশনে কন্টেইনারে সরাসরি প্লেইন টেক্সট এনভায়রনমেন্ট ভেরিয়েবল (যেমন: `DATABASE_URL=postgresql://...`) ব্যবহার করা একটি চরম সিকিউরিটি রিস্ক।

```mermaid
flowchart TD
    subgraph DockerSecretsFlow [Secure Secrets Injection via Docker Secrets]
        HostSecrets["Host Secrets Files <br>(db_password.txt / stripe_key.txt)"]
        DockerEngine["Docker Compose / Swarm Engine"]
        
        subgraph ContainerRAM [Secure Container RAM Filesystem]
            MountedSecret1["/run/secrets/db_password <br>(In-memory decrypted file)"]
            MountedSecret2["/run/secrets/stripe_key <br>(In-memory decrypted file)"]
        end
        
        HostSecrets --->|1. Loaded securely| DockerEngine
        DockerEngine --->|2. Mounts dynamically in RAM| ContainerRAM
        ContainerRAM --->|3. App reads file in RAM| AppProcess["NestJS / Next.js Process <br>(No exposure in environment variables)"]
    end
```

#### কেন Environment Variables প্রোডাকশনে অনিরাপদ?
আপনি যদি ডকার কম্পোজে সরাসরি প্লেইন টেক্সট পাসওয়ার্ড ব্যবহার করেন, তবে সার্ভারে অ্যাক্সেস থাকা যেকোনো ব্যক্তি বা ম্যালিশিয়াস প্রসেস খুব সহজে `docker inspect <container_id>` বা `docker compose config` কমান্ড রান করে আপনার সমস্ত সেন্সিটিভ পাসওয়ার্ড ও সিক্রেট এপিআই কি প্লেইন টেক্সটে দেখে নিতে পারবে।

#### সমাধান: Docker Secrets (ইন-মেমরি ফাইল মাউন্ট)
ডকার সিক্রেটস সেন্সিটিভ ডেটা সরাসরি এনভায়রনমেন্ট ভেরিয়েবলে না লিখে কন্টেইনারের ভেতরের একটি সুরক্ষিত ইন-মেমরি ওনলি লোকেশনে (**`/run/secrets/`**) ফাইল আকারে মাউন্ট করে। এই ফাইলগুলো কখনো কন্টেইনারের ডিস্কে বা ইমেজের লেয়ারে পারসিস্ট হয় না।

#### ক. ডকার কম্পোজে সিক্রেট ইন্টিগ্রেশন (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  nestjs-api:
    image: my-app:latest
    secrets:
      - db_password
      - stripe_key
    environment:
      # সরাসরি ভ্যালু না লিখে ফাইলের পাথ রিড করার ইন্সট্রাকশন দেওয়া
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - STRIPE_KEY_FILE=/run/secrets/stripe_key
    networks:
      - saas-network

secrets:
  db_password:
    file: ./secrets/db_password.txt # হোস্টের সিক্রেট টেক্সট ফাইল
  stripe_key:
    file: ./secrets/stripe_key.txt
```

#### খ. NestJS ব্যাকএন্ডে সিক্রেট ফাইল রিড করার কোড প্যাটার্ন:
আমাদের অ্যাপ্লিকেশনে সরাসরি এনভায়রনমেন্ট ভেরিয়েবল চেক না করে লিনাক্স কার্নেলের মেমরি ফাইল থেকে সিক্রেট রিড করতে এই সিকিউর কোড ডিজাইন প্যাটার্নটি ব্যবহার করতে হবে:

```typescript
import * as fs from 'fs';

export function getSecret(envVarName: string, fileEnvVarName: string): string {
  // ১. প্রথমে মেমরি মাউন্টেড সিক্রেট ফাইলের পাথ চেক করা
  const secretFilePath = process.env[fileEnvVarName];
  if (secretFilePath && fs.existsSync(secretFilePath)) {
    return fs.readFileSync(secretFilePath, 'utf8').trim();
  }
  
  // ২. ফ্যালব্যাক হিসেবে সাধারণ এনভায়রনমেন্ট ভেরিয়েবল চেক করা (ডেভেলপমেন্টের জন্য)
  return process.env[envVarName] || '';
}

// ব্যবহার করার নিয়ম:
const dbPassword = getSecret('DATABASE_PASSWORD', 'DATABASE_PASSWORD_FILE');
const stripeKey = getSecret('STRIPE_SECRET_KEY', 'STRIPE_KEY_FILE');
```

---

## ৩৫. Ultimate Docker CLI Cheat Sheet (ডকার কমান্ডের সম্পূর্ণ চিট-শীট)

ডকার ইকোসিস্টেমের দৈনন্দিন কাজ এবং অ্যাডভান্সড ট্রাবলশুটিংয়ের জন্য প্রয়োজনীয় সব কমান্ড ক্যাটাগরি অনুযায়ী সংকলন করে এই চিট-শীটটি প্রস্তুত করা হয়েছে। এটি যেকোনো সময় কুইক রেফারেন্স হিসেবে ব্যবহারের উপযোগী।

```mermaid
flowchart TD
    subgraph CheatSheetCategories [Docker Command Ecosystem]
        direction TB
        C1["Container Ops <br>(run, exec, ps, logs, rm)"]
        C2["Image Ops <br>(build, pull, rmi, tag)"]
        C3["Volume & Net <br>(create, ls, inspect, prune)"]
        C4["System Ops <br>(stats, df, system prune)"]
        C5["Compose Ops <br>(up, down, logs, ps)"]
    end
```

### ১. Container Lifecycle Management (কন্টেইনার লাইফসাইকেল কমান্ড)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker run`** | নতুন কন্টেইনার তৈরি করে রান করে। | `docker run -d -p 80:80 --name web nginx` |
| **`docker start`** | স্টপ হয়ে থাকা কন্টেইনার পুনরায় সচল করে। | `docker start web` |
| **`docker stop`** | রানিং কন্টেইনার নিরাপদভাবে স্টপ করে (`SIGTERM`)। | `docker stop web` |
| **`docker restart`** | কন্টেইনার রিস্টার্ট করে। | `docker restart web` |
| **`docker kill`** | কন্টেইনার জোরপূর্বক সাথে সাথে বন্ধ করে (`SIGKILL`)। | `docker kill web` |
| **`docker pause`** | কন্টেইনারের সব প্রসেস সাসপেন্ড/স্থগিত করে রাখে। | `docker pause web` |
| **`docker unpause`** | স্থগিত কন্টেইনার পুনরায় রানিং মোডে আনে। | `docker unpause web` |
| **`docker rm`** | স্টপড কন্টেইনার ফাইল সিস্টেম থেকে ডিলেট করে। | `docker rm web` |
| **`docker rm -f`** | রানিং কন্টেইনার জোরপূর্বক ডিলেট করে। | `docker rm -f web` |
| **`docker ps`** | রানিং কন্টেইনারগুলোর তালিকা দেখায়। | `docker ps` |
| **`docker ps -a`** | স্টপ এবং রানিং সব কন্টেইনারের তালিকা দেখায়। | `docker ps -a` |
| **`docker ps -q`** | শুধুমাত্র কন্টেইনারগুলোর আইডি (IDs) দেখায়। | `docker ps -q` |

---

### ২. Image Operations (ডকার ইমেজ কমান্ডসমূহ)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker build`** | Dockerfile থেকে নতুন ডকার ইমেজ বিল্ড করে। | `docker build -t my-app:v1 .` |
| **`docker images`** | লোকাল মেশিনে স্টোর থাকা ইমেজের তালিকা দেখায়। | `docker images` |
| **`docker rmi`** | লোকাল ইমেজ ডিলেট করে। | `docker rmi my-app:v1` |
| **`docker pull`** | ডকার হাব বা রেজিস্ট্রি থেকে ইমেজ ডাউনলোড করে। | `docker pull alpine` |
| **`docker push`** | লোকাল ইমেজ ডকার হাবে বা নিজস্ব রেজিস্ট্রিতে পাঠায়। | `docker push username/my-app:v1` |
| **`docker tag`** | ইমেজের নতুন নাম বা ট্যাগ ডিফাইন করে। | `docker tag my-app:v1 username/my-app:v1` |
| **`docker history`** | ইমেজের লেয়ারগুলো এবং তাদের সাইজ দেখায়। | `docker history alpine` |
| **`docker save`** | ইমেজকে tar ফাইলে এক্সপোর্ট করে সেভ করে। | `docker save -o app.tar my-app:v1` |
| **`docker load`** | tar ফাইল থেকে ইমেজ ইমপোর্ট করে ডকারে লোড করে। | `docker load -i app.tar` |

---

### ৩. Volume & Data Persistence (ভলিউম কমান্ডসমূহ)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker volume create`** | কন্টেইনারের বাইরে পারসিস্টেন্ট ভলিউম তৈরি করে। | `docker volume create db_data` |
| **`docker volume ls`** | তৈরি করা সব ভলিউমের তালিকা দেখায়। | `docker volume ls` |
| **`docker volume inspect`** | ভলিউমের লোকাল ডিরেক্টরি পাথ ও ডিটেইলস দেখায়। | `docker volume inspect db_data` |
| **`docker volume rm`** | নির্দিষ্ট ভলিউম ডিলেট করে। | `docker volume rm db_data` |
| **`docker volume prune`** | অব্যবহৃত (Orphaned) সব ভলিউম ডিলেট করে মেমরি ফ্রী করে। | `docker volume prune -f` |

---

### ৪. Network Configuration (নেটওয়ার্ক কমান্ডসমূহ)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker network create`** | নতুন ভার্চুয়াল নেটওয়ার্ক সাবনেট তৈরি করে। | `docker network create --driver bridge my-net` |
| **`docker network ls`** | ডকার নেটওয়ার্কগুলোর তালিকা দেখায়। | `docker network ls` |
| **`docker network inspect`** | নেটওয়ার্কের আন্ডারে থাকা কন্টেইনার ও আইপি দেখায়। | `docker network inspect my-net` |
| **`docker network connect`** | একটি রানিং কন্টেইনারকে নতুন নেটওয়ার্কে যুক্ত করে। | `docker network connect my-net web` |
| **`docker network disconnect`**| নেটওয়ার্ক থেকে কন্টেইনারের কানেকশন বিচ্ছিন্ন করে। | `docker network disconnect my-net web` |
| **`docker network rm`** | ডকার নেটওয়ার্ক ডিলিট করে। | `docker network rm my-net` |
| **`docker network prune`** | অব্যবহৃত সব ভার্চুয়াল নেটওয়ার্ক ডিলেট করে। | `docker network prune -f` |

---

### ৫. Deep Diagnostics & System Cleaning (সিস্টেম ক্লিন ও ডিবাগিং)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker exec -it`** | রানিং কন্টেইনারের শেলের ভেতর ঢুকে কমান্ড রান করে। | `docker exec -it web sh` |
| **`docker logs`** | কন্টেইনারের কনসোল আউটপুট/লগ দেখায়। | `docker logs web` |
| **`docker logs -f`** | কন্টেইনারের লাইভ রিয়েল-টাইম লগ মনিটর করে। | `docker logs -f web` |
| **`docker inspect`** | কন্টেইনারের আইপি, পোর্ট, এনভায়রনমেন্ট ও মেটাডাটা দেখায়। | `docker inspect web` |
| **`docker stats`** | রানিং কন্টেইনারগুলোর মেমরি ও সিপিইউ রিয়েল-টাইমে দেখায়। | `docker stats` |
| **`docker cp`** | কন্টেইনার ও হোস্টের মধ্যে ফাইল কপি আদান-প্রদান করে। | `docker cp index.html web:/usr/share/nginx/html/` |
| **`docker port`** | কন্টেইনারের পোর্ট ম্যাপিং ও হোস্ট পোর্ট দেখায়। | `docker port web` |
| **`docker top`** | কন্টেইনারের ভেতরে বর্তমানে রানিং প্রসেসগুলোর লিস্ট দেখায়। | `docker top web` |
| **`docker diff`** | কন্টেইনারের ফাইলসিস্টেমে হওয়া পরিবর্তনগুলোর তালিকা দেখায়। | `docker diff web` |
| **`docker system df`** | কন্টেইনার, ইমেজ ও ভলিউমের মোট ডিস্ক ব্যবহারের হিসাব দেখায়। | `docker system df` |
| **`docker system prune`** | অব্যবহৃত কন্টেইনার, ইমেজ, ক্যাশ এবং নেটওয়ার্ক এক ক্লিকে ক্লিন করে। | `docker system prune -a --volumes -f` |

---

### ৬. Docker Compose Orchestration (ডকার কম্পোজ অর্কেস্ট্রেশন কমান্ড)

| Command | Description | Example |
| :--- | :--- | :--- |
| **`docker compose up`** | docker-compose.yml ফাইলের সব সার্ভিস ক্রিয়েট ও রান করে। | `docker compose up` |
| **`docker compose up -d`** | সার্ভিসগুলো ব্যাকগ্রাউন্ডে (Detached Mode) সচল করে। | `docker compose up -d` |
| **`docker compose up --build`**| ইমেজ রিবিল্ড করে সম্পূর্ণ স্ট্যাক চালু করে। | `docker compose up --build -d` |
| **`docker compose down`** | সার্ভিসগুলো স্টপ করে সব নেটওয়ার্ক ও কন্টেইনার ডিলেট করে। | `docker compose down` |
| **`docker compose down -v`** | কন্টেইনার ও নেটওয়ার্কের সাথে ডাটাবেস ভলিউমও ডিলিট করে। | `docker compose down -v` |
| **`docker compose ps`** | কম্পোজ ফাইলের আন্ডারে থাকা সার্ভিসগুলোর স্ট্যাটাস দেখায়। | `docker compose ps` |
| **`docker compose logs -f`** | সব সার্ভিসের কনসোল লগ রিয়েল-টাইমে কম্বাইনড করে দেখায়। | `docker compose logs -f` |
| **`docker compose exec`** | কম্পোজ সার্ভিসের ভেতর ঢুকে ইন্টারঅ্যাক্টিভ কমান্ড রান করে। | `docker compose exec backend sh` |
| **`docker compose config`** | কম্পোজ ফাইলের কোনো সিনট্যাক্স এরর আছে কিনা তা ভ্যালিডেট করে। | `docker compose config` |
| **`docker compose restart`** | সব ডকার কম্পোজ সার্ভিস রিস্টার্ট করে। | `docker compose restart` |

---

## 💡 Senior Architect Insights & Best Practices Summary

> "ডকার মানে কেবল পোর্টেবিলিটি নয়, এটি হলো ডিস্ট্রিবিউটেড সিস্টেমের রিসোর্স অপ্টিমাইজেশন ও সিকিউরিটি বাউন্ডারির ভিত্তি. কার্নেলের আচরণ বুঝে কনফিগার করা কন্টেইনার আমাদের ক্লাউড খরচ অর্ধেকের বেশি কমিয়ে দিতে পারে।"

১. **Use Distroless or Alpine Images:** বেস ইমেজ হিসেবে বড় ওএসের পরিবর্তে (যেমন Ubuntu) স্রেফ রানটাইম সমৃদ্ধ **Distroless** বা **Alpine** ব্যবহার করুন। এতে ইমেজের এটাক সারফেস (Vulnerability) এবং সাইজ প্রায় ৯০% কমে যায়।
২. **Avoid `--privileged` Flag:** `--privileged` ফ্ল্যাগ দিলে কন্টেইনার হোস্টের সমস্ত ডিভাইস ড্রাইভার ও মেমরি সরাসরি টাচ করার পারমিশন পায়। এটি কন্টেইনার আইসোলেশন দেওয়ালকে ভেঙে চুরমার করে দেয়।
৩. **Read-Only Root Filesystem:** সিকিউরিটি আরও জোরদার করতে কন্টেইনারের রুট ফাইলসিস্টেম রিড-অনলি হিসেবে মাউন্ট করতে পারেন (`--read-only`), শুধুমাত্র প্রয়োজনীয় নির্দিষ্ট লগ বা টেম্প ডিরেক্টরিগুলোকে ভলিউম দিয়ে ওপেন রেখে।

---





