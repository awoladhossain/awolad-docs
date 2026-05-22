---
title: "ডাটাবেজ ডিজাইন ও SQL কনসেপ্ট"
description: "নর্মালাইজেশন, BCNF, N+1 Query Problem, রিলেশনশিপ, referential action, WHERE, HAVING এবং GROUP BY নিয়ে একটি সংক্ষিপ্ত প্রফেশনাল গাইড।"
category: "Database"
---

# ডাটাবেজ ডিজাইন ও SQL কনসেপ্ট

এই নোটে ডাটাবেজ ডিজাইনের কিছু গুরুত্বপূর্ণ ধারণা সংক্ষেপে ব্যাখ্যা করা হয়েছে। লক্ষ্য হলো টেবিল ডিজাইন, ডেটা ডুপ্লিকেশন কমানো, কুয়েরি পারফরম্যান্স বোঝা এবং SQL aggregation পরিষ্কারভাবে ব্যবহার করা।

## Normalization

Normalization হলো এমন একটি ডিজাইন প্রক্রিয়া যার মাধ্যমে ডেটাবেজে ডুপ্লিকেশন কমানো, ডেটার consistency বজায় রাখা এবং update anomaly, insert anomaly, delete anomaly কমানো হয়।

### 1NF: First Normal Form

একটি টেবিল 1NF-এ থাকতে হলে প্রতিটি কলামে atomic value থাকতে হবে। অর্থাৎ একটি সেলে একাধিক মান রাখা যাবে না।

উদাহরণ হিসেবে `skills` কলামে `SQL, Java, PHP` একসাথে রাখা হলে সেটি 1NF ভঙ্গ করে। এর পরিবর্তে প্রতিটি skill আলাদা row বা আলাদা related table-এ রাখা উচিত।

মূল নিয়ম:

- একটি সেলে একটি মাত্র value থাকবে।
- repeating group রাখা যাবে না।
- একই ধরনের multiple values আলাদা row বা child table-এ যাবে।

### 2NF: Second Normal Form

2NF মূলত composite primary key থাকা টেবিলের ক্ষেত্রে গুরুত্বপূর্ণ। একটি টেবিল 2NF-এ থাকতে হলে সেটি আগে 1NF হতে হবে এবং কোনো non-key column composite key-এর আংশিক অংশের ওপর নির্ভর করতে পারবে না।

উদাহরণ:

```text
Enrollment(StudentID, CourseID, CourseName, StudentName)
```

এখানে primary key যদি `(StudentID, CourseID)` হয়, তাহলে `CourseName` শুধু `CourseID`-এর ওপর নির্ভর করে। এটি partial dependency। তাই `CourseName` আলাদা `Courses` টেবিলে রাখা উচিত।

মূল নিয়ম:

- composite key থাকলে non-key column পুরো key-এর ওপর নির্ভর করবে।
- key-এর শুধু একটি অংশের ওপর dependency থাকলে আলাদা table তৈরি করতে হবে।

### 3NF: Third Normal Form

একটি টেবিল 3NF-এ থাকতে হলে সেটি আগে 2NF হতে হবে এবং কোনো non-key column অন্য non-key column-এর ওপর নির্ভর করতে পারবে না। এটিকে transitive dependency বলা হয়।

উদাহরণ:

```text
Employee(EmployeeID, DepartmentID, DepartmentName)
```

এখানে `EmployeeID` থেকে `DepartmentID` জানা যায়, আবার `DepartmentID` থেকে `DepartmentName` জানা যায়। তাই `DepartmentName` সরাসরি employee table-এ না রেখে আলাদা `Departments` table-এ রাখা ভালো।

মূল নিয়ম:

- non-key column শুধু primary key-এর ওপর নির্ভর করবে।
- non-key থেকে non-key dependency থাকলে সেটি আলাদা table-এ নিতে হবে।

### BCNF: Boyce-Codd Normal Form

BCNF হলো 3NF-এর আরও কঠোর রূপ। কোনো functional dependency `X -> Y` থাকলে `X` অবশ্যই super key হতে হবে।

সহজভাবে বলা যায়, একটি টেবিলে যে column বা column-set অন্য column নির্ধারণ করছে, সেটি পুরো row uniquely identify করতে সক্ষম হতে হবে।

মূল নিয়ম:

- প্রতিটি determinant অবশ্যই super key হবে।
- কোনো non-key determinant থাকলে table decomposition করতে হবে।
- BCNF সাধারণত dependency conflict এবং hidden redundancy কমাতে সাহায্য করে।

### Normalization Summary

| Normal Form | মূল উদ্দেশ্য |
| :--- | :--- |
| 1NF | প্রতিটি সেলে atomic value রাখা |
| 2NF | partial dependency দূর করা |
| 3NF | transitive dependency দূর করা |
| BCNF | প্রতিটি determinant-কে super key নিশ্চিত করা |

## N+1 Query Problem

N+1 Query Problem ঘটে যখন একটি parent list আনতে ১টি query চালানো হয়, তারপর প্রতিটি parent row-এর related data আনতে আলাদা query চালানো হয়।

ধরা যাক `authors` এবং `books` নামে দুটি table আছে। সব author এবং তাদের book title দেখাতে গিয়ে যদি প্রথমে authors আনা হয় এবং পরে loop-এর ভেতর প্রতিটি author-এর books query করা হয়, তাহলে N+1 সমস্যা তৈরি হবে।

সমস্যাযুক্ত প্যাটার্ন:

```sql
SELECT * FROM authors;
```

এরপর প্রতিটি author-এর জন্য:

```sql
SELECT * FROM books WHERE author_id = 1;
SELECT * FROM books WHERE author_id = 2;
SELECT * FROM books WHERE author_id = 3;
```

যদি author সংখ্যা 100 হয়, তাহলে মোট query হবে 101টি। এটি response time বাড়ায় এবং database server-এর ওপর অপ্রয়োজনীয় চাপ তৈরি করে।

### সমাধান

সাধারণ সমাধান হলো eager loading, JOIN, batching অথবা preloading ব্যবহার করা।

SQL JOIN উদাহরণ:

```sql
SELECT authors.name, books.title
FROM authors
JOIN books ON authors.id = books.author_id;
```

ORM উদাহরণ:

```php
$authors = Author::with('books')->get();
```

ভালো practice:

- loop-এর ভেতরে repeated database query এড়ান।
- relationship data আগে থেকেই eager load করুন।
- large dataset হলে pagination এবং selective column ব্যবহার করুন।
- query count monitoring করার জন্য debug toolbar বা profiler ব্যবহার করুন।

## Database Relationships

Database relationship নির্ধারণ করার সময় দুই দিক থেকেই প্রশ্ন করা উচিত। একটি entity অন্য entity-এর কতগুলো record-এর সাথে যুক্ত হতে পারে, সেটিই relationship type নির্ধারণ করে।

### One-to-One

একটি record অন্য table-এর সর্বোচ্চ একটি record-এর সাথে যুক্ত থাকে।

উদাহরণ:

```text
User -> UserProfile
```

চেনার উপায়:

- `profiles` table-এ `user_id` foreign key থাকবে।
- `user_id` সাধারণত unique constraint সহ থাকবে।
- একটি user-এর একটি profile, এবং একটি profile শুধু একটি user-এর।

### One-to-Many

একটি parent record-এর অনেকগুলো child record থাকতে পারে, কিন্তু প্রতিটি child record একটি parent-এর সাথে যুক্ত থাকে।

উদাহরণ:

```text
Customer -> Orders
Post -> Comments
Category -> Products
```

চেনার উপায়:

- foreign key সবসময় many side-এ থাকে।
- `orders` table-এ `customer_id` থাকবে।
- একটি customer অনেক order করতে পারে, কিন্তু একটি order একটি customer-এর।

### Many-to-Many

দুই দিকেই একাধিক record যুক্ত হতে পারে। এই relationship বাস্তবায়নের জন্য একটি junction, bridge বা pivot table দরকার হয়।

উদাহরণ:

```text
Student <-> Course
Post <-> Tag
```

চেনার উপায়:

- মাঝখানে আলাদা table থাকে।
- `enrollments(student_id, course_id)` বা `post_tags(post_id, tag_id)` এর মতো structure ব্যবহার হয়।
- junction table-এ প্রয়োজনে অতিরিক্ত column রাখা যায়, যেমন `enrolled_at`, `status`, `created_at`।

## Foreign Key Placement

| Relationship | Foreign Key কোথায় থাকবে |
| :--- | :--- |
| One-to-One | যেই table dependent, সেখানে unique foreign key |
| One-to-Many | many side বা child table-এ |
| Many-to-Many | junction বা pivot table-এ দুই table-এর foreign key |

## SQL Delete Rules

Referential action নির্ধারণ করে parent row delete বা update হলে child table-এর related row-গুলোর ওপর কী প্রভাব পড়বে।

### ON DELETE CASCADE

Parent row delete হলে child table-এর related row-গুলোও delete হয়ে যায়।

ব্যবহার করবেন যখন child data parent ছাড়া অর্থপূর্ণ নয়। যেমন একটি invoice delete হলে তার invoice items delete হওয়া স্বাভাবিক হতে পারে।

### ON DELETE SET NULL

Parent row delete হলে child table-এর foreign key column `NULL` হয়ে যায়। এ ক্ষেত্রে foreign key column nullable হতে হবে।

ব্যবহার করবেন যখন child data রাখতে হবে, কিন্তু relationship বিচ্ছিন্ন করা যাবে। যেমন কোনো employee resign করলে project table-এর `manager_id` null করা।

### ON DELETE RESTRICT বা NO ACTION

Child row থাকা অবস্থায় parent row delete করতে দেয় না। এটি accidental delete থেকে data protect করে।

ব্যবহার করবেন যখন parent data delete করার আগে related child data manually handle করা প্রয়োজন।

### ON DELETE SET DEFAULT

Parent row delete হলে child foreign key column একটি predefined default value পায়। এটি database support এবং schema design-এর ওপর নির্ভর করে।

### Referential Action Summary

| Rule | Parent delete হলে child data |
| :--- | :--- |
| CASCADE | related row delete হয় |
| SET NULL | foreign key null হয় |
| RESTRICT / NO ACTION | delete operation block হয় |
| SET DEFAULT | default value বসে |

SQL উদাহরণ:

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE
);
```

## WHERE vs HAVING

`WHERE` এবং `HAVING` দুটোই filtering-এর জন্য ব্যবহৃত হয়, কিন্তু তাদের কাজের সময় আলাদা।

| বিষয় | WHERE | HAVING |
| :--- | :--- | :--- |
| কখন কাজ করে | grouping-এর আগে | grouping-এর পরে |
| কী filter করে | individual row | grouped result |
| aggregate function | সাধারণত ব্যবহার করা যায় না | aggregate condition-এ ব্যবহার হয় |
| performance impact | আগেই row কমায় | group তৈরি হওয়ার পর filter করে |

উদাহরণ:

```sql
SELECT customer_id, COUNT(*) AS total_orders
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING COUNT(*) >= 5;
```

এখানে `WHERE` paid order ছাড়া অন্য row বাদ দেয়। এরপর `GROUP BY` customer অনুযায়ী group তৈরি করে। শেষে `HAVING` শুধু সেই customer রাখে যাদের paid order সংখ্যা ৫ বা তার বেশি।

## GROUP BY

`GROUP BY` একই value থাকা row-গুলোকে group করে summary result তৈরি করে। এটি সাধারণত aggregate function-এর সাথে ব্যবহার হয়।

Common aggregate function:

- `COUNT()` total row count বের করে।
- `SUM()` numeric value-এর total বের করে।
- `AVG()` average বের করে।
- `MAX()` সবচেয়ে বড় value বের করে।
- `MIN()` সবচেয়ে ছোট value বের করে।

উদাহরণ:

```sql
SELECT category_id, COUNT(*) AS total_products
FROM products
GROUP BY category_id;
```

এই query প্রতিটি category-তে কতটি product আছে তা দেখাবে।

## SQL Execution Order

SQL query লেখার order এবং execution order এক নয়। সাধারণত logical execution order এমন:

1. `FROM`
2. `JOIN`
3. `WHERE`
4. `GROUP BY`
5. `HAVING`
6. `SELECT`
7. `ORDER BY`
8. `LIMIT`

এই order বুঝলে `WHERE`, `GROUP BY` এবং `HAVING` ঠিকভাবে ব্যবহার করা সহজ হয়।
