---
title: "Memory Management"
description: "Pointers, stack, heap, process memory layout, garbage collection, memory leak, dangling pointer এবং double pointer নিয়ে একটি structured guide।"
category: "Programming"
---

# Memory Management

Memory management হলো প্রোগ্রাম চলার সময় মেমোরি কীভাবে allocate, use এবং release করা হয় তা বোঝার প্রক্রিয়া। C/C++-এর মতো ভাষায় programmer নিজে memory manage করে, আর Java, Python, JavaScript-এর মতো ভাষায় runtime বা garbage collector অনেক অংশ manage করে।

এই নোটে pointer, stack, heap, process memory layout এবং common memory-related bug পরিষ্কারভাবে ব্যাখ্যা করা হয়েছে।

## Pointer কী

Pointer হলো এমন একটি variable যা অন্য একটি variable-এর memory address ধরে রাখে।

উদাহরণ:

```cpp
int x = 10;
int* ptr = &x;

cout << x;     // 10
cout << ptr;   // x-এর memory address
cout << *ptr;  // 10
```

এখানে:

- `x` একটি normal integer variable।
- `&x` হলো `x` variable-এর address।
- `ptr` সেই address store করছে।
- `*ptr` address follow করে actual value বের করছে।

## Address এবং Dereferencing

Pointer বুঝতে দুটি operator গুরুত্বপূর্ণ।

| Operator | Name | কাজ |
| :--- | :--- | :--- |
| `&` | Address-of operator | কোনো variable-এর memory address বের করে |
| `*` | Dereference operator | pointer যে address ধরে রেখেছে, সেই address-এর value বের করে |

উদাহরণ:

```cpp
int x = 5;
int* p = &x;

cout << p;   // address of x
cout << *p;  // value of x
```

Memory view:

```text
+----------+-----------+-------+
| Variable | Address   | Value |
+----------+-----------+-------+
| x        | 0x101     | 5     |
| p        | 0x202     | 0x101 |
+----------+-----------+-------+
```

## Process Memory Layout

একটি program যখন process হিসেবে memory-তে load হয়, সাধারণত সেটি কয়েকটি logical segment-এ ভাগ হয়।

```text
High Address
+---------------------------------------+
| Kernel Space                          |
+---------------------------------------+
| Stack                                 |
| Local variables, function calls       |
+---------------------------------------+
| Unused Memory                         |
+---------------------------------------+
| Heap                                  |
| Dynamic allocation: new, malloc       |
+---------------------------------------+
| BSS Segment                           |
| Uninitialized global/static variables |
+---------------------------------------+
| Data Segment                          |
| Initialized global/static variables   |
+---------------------------------------+
| Code / Text Segment                   |
| Program instructions                  |
+---------------------------------------+
Low Address
```

## Memory Segments

### Code Segment

Code segment বা text segment-এ compiled program instruction থাকে।

- সাধারণত read-only হয়।
- function body, control flow এবং executable instruction এখানে থাকে।
- runtime-এ সাধারণ application code এই অংশ modify করে না।

### Data Segment

Data segment-এ initialized global এবং static variable থাকে।

```cpp
int totalVisitors = 1000;
static int maxUsers = 500;
```

এই variable-গুলো program শুরু থেকে শেষ পর্যন্ত memory-তে থাকে।

### BSS Segment

BSS segment-এ uninitialized global এবং static variable থাকে।

```cpp
int counter;
static int cacheSize;
```

এগুলো সাধারণত default value হিসেবে zero-initialized হয়।

### Stack

Stack হলো fast memory area যেখানে function call, local variable এবং function argument রাখা হয়।

বৈশিষ্ট্য:

- LIFO: Last In, First Out।
- function call হলে stack frame তৈরি হয়।
- function return করলে সেই stack frame automatically remove হয়।
- অতিরিক্ত deep recursion হলে stack overflow হতে পারে।

উদাহরণ:

```cpp
void calculateDiscount(int price) {
  int discount = 10;
  int finalPrice = price - discount;
}
```

এখানে `price`, `discount` এবং `finalPrice` stack frame-এর ভেতরে থাকে।

### Heap

Heap হলো dynamic memory allocation-এর জায়গা। runtime-এ প্রয়োজন অনুযায়ী memory allocate করা যায়।

```cpp
int* value = new int;
*value = 20;

delete value;
```

বৈশিষ্ট্য:

- `new`, `malloc` ইত্যাদি দিয়ে memory allocate করলে heap ব্যবহার হয়।
- C/C++-এ manually release করতে হয়।
- Java/Python/JavaScript-এর মতো ভাষায় garbage collector unreachable object cleanup করে।
- heap allocation stack allocation-এর তুলনায় ধীর এবং বেশি careful management দরকার।

## Stack vs Heap

| বিষয় | Stack | Heap |
| :--- | :--- | :--- |
| Allocation | automatic | manual বা runtime managed |
| Speed | faster | comparatively slower |
| Lifetime | function scope পর্যন্ত | programmer/runtime release না করা পর্যন্ত |
| Use case | local variable, function call | dynamic object, array, large data |
| Common issue | stack overflow | memory leak, fragmentation |

## User Space vs Kernel Space

Operating system memory protection-এর জন্য process memory সাধারণত user space এবং kernel space-এ ভাগ করা হয়।

### User Space

Application code user space-এ চলে। সাধারণ application সরাসরি hardware বা kernel memory access করতে পারে না।

### Kernel Space

Kernel space operating system-এর protected area। hardware, process scheduling, file system এবং network operation kernel manage করে।

যখন application file read/write, network call বা console output করে, তখন system call-এর মাধ্যমে kernel-এর কাছে request পাঠায়।

## Garbage Collection

Garbage collection হলো runtime-managed memory cleanup process। কোনো object যদি program-এর কোনো active reference থেকে reachable না হয়, তাহলে সেটি garbage হিসেবে consider করা হয় এবং garbage collector সেটি memory থেকে সরিয়ে দিতে পারে।

গুরুত্বপূর্ণ বিষয়:

- GC heap memory monitor করে।
- unreachable object cleanup করে।
- GC চলার সময় কিছু runtime-এ short pause হতে পারে।
- high-performance system-এ unnecessary object allocation কমানো গুরুত্বপূর্ণ।

## Memory Leak

Memory leak ঘটে যখন heap memory allocate করা হয়, কিন্তু কাজ শেষে release করা হয় না।

সমস্যাযুক্ত C++ উদাহরণ:

```cpp
void calculateDiscount(int price) {
  int* finalPrice = new int;
  *finalPrice = price - 10;

  cout << *finalPrice;
  // delete finalPrice; missing
}
```

সঠিক সংস্করণ:

```cpp
void calculateDiscount(int price) {
  int* finalPrice = new int;
  *finalPrice = price - 10;

  cout << *finalPrice;

  delete finalPrice;
  finalPrice = nullptr;
}
```

Memory leak-এর প্রভাব:

- application-এর RAM usage ধীরে ধীরে বাড়ে।
- long-running service unstable হতে পারে।
- eventually crash বা out-of-memory error হতে পারে।

## Dangling Pointer

Dangling pointer হলো এমন pointer যা এমন memory address ধরে রাখে যেটি ইতিমধ্যে release হয়ে গেছে।

সমস্যাযুক্ত উদাহরণ:

```cpp
int* p = new int(10);
delete p;

cout << *p; // undefined behavior
```

সঠিক practice:

```cpp
int* p = new int(10);
delete p;
p = nullptr;
```

## Double Delete

একই memory block দুইবার `delete` বা `free` করলে double delete সমস্যা হয়।

```cpp
int* p = new int(10);

delete p;
delete p; // unsafe
```

এটি undefined behavior, crash বা security issue তৈরি করতে পারে। `delete` করার পর pointer `nullptr` করা safer practice।

## Practical Example

নিচের code-এ একাধিক memory segment দেখা যায়।

```cpp
#include <iostream>
using namespace std;

int totalVisitors = 1000; // Data segment
int pendingJobs;          // BSS segment

void calculateDiscount(int price) {
  int discount = 10;             // Stack
  int* finalPrice = new int;     // Pointer on stack, value on heap

  *finalPrice = price - discount;
  cout << *finalPrice;

  delete finalPrice;
  finalPrice = nullptr;
}

int main() {
  calculateDiscount(500);
  return 0;
}
```

এই code-এ:

- compiled instruction থাকে code segment-এ।
- `totalVisitors` থাকে data segment-এ।
- `pendingJobs` থাকে BSS segment-এ।
- `price`, `discount`, `finalPrice` pointer variable stack frame-এ থাকে।
- `new int` দিয়ে allocate করা actual integer heap-এ থাকে।

## Swap Function Using Pointers

Pointer ব্যবহার করে function-এর বাইরে থাকা original variable modify করা যায়, কারণ function-এ value নয়, address পাঠানো হয়।

```cpp
#include <iostream>
using namespace std;

void swapValues(int* x, int* y) {
  int temp = *x;
  *x = *y;
  *y = temp;
}

int main() {
  int a = 10;
  int b = 20;

  swapValues(&a, &b);

  cout << "a: " << a << ", b: " << b;
  return 0;
}
```

Step-by-step:

1. `a` এবং `b` main function-এর stack frame-এ থাকে।
2. `swapValues(&a, &b)` call করার সময় `a` এবং `b`-এর address পাঠানো হয়।
3. `x` এবং `y` pointer সেই address ধরে।
4. `*x` এবং `*y` ব্যবহার করে original value update করা হয়।
5. function শেষ হলেও original variable-এর value পরিবর্তিত থাকে।

## Double Pointer

Double pointer এমন pointer যা আরেকটি pointer-এর address ধরে রাখে।

```cpp
int x = 10;
int* p = &x;
int** pp = &p;

cout << x;     // 10
cout << *p;    // 10
cout << **pp;  // 10
```

Memory view:

```text
+----------+-----------+-------+
| Variable | Address   | Value |
+----------+-----------+-------+
| x        | 0x101     | 10    |
| p        | 0x202     | 0x101 |
| pp       | 0x303     | 0x202 |
+----------+-----------+-------+
```

Double pointer ব্যবহার হয়:

- dynamic 2D array বা matrix represent করতে।
- function-এর ভেতর থেকে original pointer update করতে।
- low-level API-তে output parameter হিসেবে pointer return করতে।

## Const with Pointers

Pointer-এর সাথে `const` ব্যবহারের position অনুযায়ী অর্থ বদলায়।

### Pointer to Constant

Pointer অন্য address-এ যেতে পারে, কিন্তু pointer দিয়ে value modify করা যায় না।

```cpp
const int* p = &x;

// *p = 20; invalid
p = &y;      // valid
```

### Constant Pointer

Pointer একবার যেই address ধরে, পরে অন্য address-এ যেতে পারে না। কিন্তু pointed value modify করা যায়।

```cpp
int* const p = &x;

*p = 20;     // valid
// p = &y;   // invalid
```

### Constant Pointer to Constant

Pointer-এর address change করা যায় না এবং pointer দিয়ে value modify করাও যায় না।

```cpp
const int* const p = &x;

// *p = 20; invalid
// p = &y;   // invalid
```

Summary:

| Syntax | Pointer move করতে পারবে | Value modify করতে পারবে |
| :--- | :---: | :---: |
| `const int* p` | Yes | No |
| `int* const p` | No | Yes |
| `const int* const p` | No | No |

## Best Practices

- C++-এ raw pointer-এর বদলে সম্ভব হলে smart pointer ব্যবহার করুন।
- `new` ব্যবহার করলে matching `delete` নিশ্চিত করুন।
- `delete` করার পর pointer `nullptr` set করুন।
- function ownership clear রাখুন: কে memory allocate করবে এবং কে release করবে।
- recursion use করলে stack depth সম্পর্কে সতর্ক থাকুন।
- unnecessary heap allocation এড়িয়ে চলুন।
