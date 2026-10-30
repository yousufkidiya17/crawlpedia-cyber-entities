# 🕸️ CRAWLPEDIA // CYBER ENTITIES v5.0
### Autonomous 60 FPS Procedural Inverse Kinematics Engine for Live Webpages

[![Manifest V3](https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![ECMAScript 2024](https://img.shields.io/badge/JavaScript-Vanilla%20ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Framerate](https://img.shields.io/badge/FPS-60%20Hz%20Smooth%20IK-00ff66?style=for-the-badge)](https://en.wikipedia.org/wiki/Inverse_kinematics)
[![Dependencies](https://img.shields.io/badge/Dependencies-ZERO%20(Pure%20DOM%20%2F%20Canvas)-00f0ff?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-ff003c?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-purple?style=for-the-badge)](https://github.com/yousufkidiya17/crawlpedia-cyber-entities/pulls)

---

```
   _____ _____         __          ___      _____  ______ _____ _____         
  / ____|  __ \     /\ \ \        / / |    |  __ \|  ____|  __ \_   _|   /\   
 | |    | |__) |   /  \ \ \  /\  / /| |    | |__) | |__  | |  | || |    /  \  
 | |    |  _  /   / /\ \ \ \/  \/ / | |    |  ___/|  __| | |  | || |   / /\ \ 
 | |____| | \ \  / ____ \ \  /\  /  | |____| |    | |____| |__| |_| |_ / ____ \ 
  \_____|_|  \_\/_/    \_\ \/  \/   |______|_|    |______|_____/|_____/_/    \_\
               [ CYBERNETIC WIREFRAME ENTITY RUNTIME // v5.0.0 ]
```

---

## ⚡ Executive Summary

**Crawlpedia Cyber Edition** is a high-performance, autonomous mechanical browser companion engineered with procedural **Inverse Kinematics (IK)**, real-time **Reynolds Arrival Steering**, and dynamic **Web Audio API** procedural sound synthesis. 

Unlike traditional static web overlays or animated GIFs, Crawlpedia injects an isolated, zero-overhead HTML5 Canvas viewport directly over any live webpage (`z-index: 999999`, `pointer-events: none`). The entity dynamically crawls across the DOM, tracks cursor coordinates, anchors catenary laser filaments, and emits electric sparks upon footfall impact—all running at a locked **60 FPS** with zero frame drops or memory leaks.

---

## 🔬 Core Engineering Highlights

### 1. 3-Point Law-of-Cosines Inverse Kinematics (Spider Mode)
Each of the 8 spider limbs is calculated via an analytical 2-segment planar kinematic chain ($l_1 = 30\text{px}$, $l_2 = 36\text{px}$). For any coxa anchor $\mathbf{A}(x_a, y_a)$ and target foot resting vector $\mathbf{F}(x_f, y_f)$:

$$\text{Distance } d = \min\left(\sqrt{(x_f - x_a)^2 + (y_f - y_a)^2},\; l_1 + l_2 - 0.5\right)$$

$$\alpha = \arccos\left(\text{clamp}\left(\frac{l_1^2 + d^2 - l_2^2}{2 \cdot l_1 \cdot d},\; -1,\; 1\right)\right)$$

$$\theta_{\text{knee}} = \operatorname{atan2}(y_f - y_a, x_f - x_a) + \alpha \cdot \text{bendSide}$$

$$\mathbf{K}_{\text{knee}} = \begin{bmatrix} x_a + l_1 \cos(\theta_{\text{knee}}) \\ y_a + l_1 \sin(\theta_{\text{knee}}) \end{bmatrix}$$

This produces anatomically accurate leg bend curvature with zero jitter.

---
