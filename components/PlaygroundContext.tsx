'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TerminalLine {
  type: 'stdout' | 'stderr' | 'system';
  text: string;
}

interface PlaygroundContextType {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  terminalOutput: TerminalLine[];
  setTerminalOutput: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  isRunning: boolean;
  runCode: (codeToRun?: string, langToRun?: string) => Promise<void>;
  clearTerminal: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

// Language mapping for Judge0 CE API
const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 93,
  js: 93,
  typescript: 94,
  ts: 94,
  python: 100,
  py: 100,
  go: 106,
  golang: 106,
  cpp: 105,
  c: 103,
  sql: 82,
  sqlite: 82,
  bash: 46,
  sh: 46,
};

const DEFAULT_BOILERPLATES: Record<string, string> = {
  javascript: `// JavaScript Systems Internals Demo
const heapMemory = {
  allocated: "64MB",
  gcStatus: "idle",
  nodes: ["V8", "Ignition", "TurboFan"]
};

console.log("🚀 Initializing JS Sandbox...");
console.log("Memory Heap Details:", JSON.stringify(heapMemory, null, 2));

// Simulate high performance execution
const startTime = Date.now();
let count = 0;
for (let i = 0; i < 1000000; i++) {
  count += i;
}
console.log("Loop sum count:", count);
console.log(\`⚡ Process finished in \${Date.now() - startTime}ms\`);
`,
  typescript: `// TypeScript Static Typing Verification
interface SystemNode {
  id: number;
  label: string;
  active: boolean;
}

const initializeNode = (id: number, label: string): SystemNode => {
  return { id, label, active: true };
};

const node = initializeNode(101, "Core-Kernel-V8");
console.log("Initializing Static Type-Safe Node:", node);
`,
  python: `# Python Systems Analysis
import time

print("🐍 Python WebAssembly Sandbox initialized")
start = time.time()

# Let's benchmark a simple generator
squares = [x * x for x in range(1000)]
print(f"Generated {len(squares)} square integers.")
print(f"⚡ CPU Execution benchmark: {(time.time() - start) * 1000:.3f}ms")
`,
  go: `package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("🐹 Go GMP Scheduler simulation")
	start := time.Now()
	
	ch := make(chan string)
	go func() {
		time.Sleep(10 * time.Millisecond)
		ch <- "Message from Goroutine channel"
	}()
	
	msg := <-ch
	fmt.Println("Received:", msg)
	fmt.Printf("⚡ Executed in %s\\n", time.Since(start))
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "⚙️ C++ System Compiling..." << std::endl;
    std::vector<int> v = {1, 2, 3, 4, 5};
    int sum = std::accumulate(v.begin(), v.end(), 0);
    std::cout << "Sum of elements: " << sum << std::endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    printf("💾 Raw C Pointer memory mapping\\n");
    int var = 42;
    int *ptr = &var;
    printf("Variable Value: %d\\n", var);
    printf("Memory Location (Pointer Address): %p\\n", (void*)ptr);
    return 0;
}
`,
  sql: `-- SQLite Database engine execution
CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY,
    component TEXT,
    latency_ms REAL
);

INSERT INTO system_metrics (component, latency_ms) VALUES ('V8 Engine', 12.5);
INSERT INTO system_metrics (component, latency_ms) VALUES ('libuv Loop', 0.85);
INSERT INTO system_metrics (component, latency_ms) VALUES ('epoll Poll', 0.05);

SELECT * FROM system_metrics;
`,
};

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState(DEFAULT_BOILERPLATES.javascript);
  const [language, setLanguageState] = useState('javascript');
  const [isOpen, setIsOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([
    { type: 'system', text: 'Welcome to MD Core Code Playground!' },
    { type: 'system', text: 'Click [Run] above to compile and execute code in a sandboxed runtime environment.' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const setLanguage = (lang: string) => {
    const cleanLang = lang.toLowerCase();
    setLanguageState(cleanLang);
    // If the editor has default boilerplate and the user hasn't changed it, switch boilerplate
    if (DEFAULT_BOILERPLATES[cleanLang]) {
      setCodeState(DEFAULT_BOILERPLATES[cleanLang]);
    }
  };

  const setCode = (newCode: string) => {
    setCodeState(newCode);
  };

  const clearTerminal = () => {
    setTerminalOutput([]);
  };

  const runCode = async (codeToRun?: string, langToRun?: string) => {
    const finalCode = codeToRun ?? code;
    const finalLang = langToRun ?? language;

    if (!finalCode.trim()) {
      setTerminalOutput((prev) => [...prev, { type: 'system', text: '⚠️ Error: Code block is empty.' }]);
      return;
    }

    setIsRunning(true);
    setTerminalOutput((prev) => [
      ...prev,
      { type: 'system', text: `⚙️ Compiling and running ${finalLang} code...` }
    ]);

    try {
      const languageId = LANGUAGE_ID_MAP[finalLang] || 93;
      
      const toBase64 = (str: string) => {
        try {
          return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
          return btoa(str);
        }
      };

      const fromBase64 = (str: string) => {
        if (!str) return '';
        try {
          return decodeURIComponent(escape(atob(str)));
        } catch (e) {
          return atob(str);
        }
      };

      const response = await fetch('https://ce.judge0.com/submissions?wait=true&base64_encoded=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: toBase64(finalCode),
          language_id: languageId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Execution request failed with status: ${response.status}`);
      }

      const data = await response.json();

      const lines: TerminalLine[] = [];
      
      const stdout = fromBase64(data.stdout || '');
      const stderr = fromBase64(data.stderr || '');
      const compile_output = fromBase64(data.compile_output || '');
      
      if (stdout) {
        stdout.split('\n').forEach((line: string) => {
          if (line || line === '') {
            lines.push({ type: 'stdout', text: line });
          }
        });
      }
      
      if (stderr) {
        stderr.split('\n').forEach((line: string) => {
          if (line) {
            lines.push({ type: 'stderr', text: line });
          }
        });
      }

      if (compile_output) {
        compile_output.split('\n').forEach((line: string) => {
          if (line) {
            lines.push({ type: 'stderr', text: line });
          }
        });
      }

      // Remove trailing empty line if it was split
      if (lines.length > 0 && lines[lines.length - 1].text === '' && lines[lines.length - 1].type === 'stdout') {
        lines.pop();
      }

      if (data.status) {
        const exitCodeText = `Process finished with status: ${data.status.description} (${data.time ? `${data.time}s` : '0s'}, ${data.memory ? `${(data.memory / 1024).toFixed(2)} MB` : '0 MB'})`;
        lines.push({ type: 'system', text: exitCodeText });
      } else {
        lines.push({ type: 'system', text: 'Process finished.' });
      }

      setTerminalOutput((prev) => [...prev, ...lines]);
    } catch (error: any) {
      console.error(error);
      setTerminalOutput((prev) => [
        ...prev,
        { type: 'stderr', text: `Network Error: Unable to reach sandbox server. (${error.message})` }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PlaygroundContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage,
        isOpen,
        setIsOpen,
        terminalOutput,
        setTerminalOutput,
        isRunning,
        runCode,
        clearTerminal,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
