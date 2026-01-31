# Campus Nodes by asterxsk

> The ultimate campus marketplace and community platform.
> Built for students, by students.

This is the official GitHub repository for the **CampusNodes** project. An immersive e-commerce and social platform designed to connect students for buying, selling, services, and networking.

## 🌐 Socials:
[![Discord](https://img.shields.io/badge/Discord-%237289DA.svg?logo=discord&logoColor=white)](https://discord.gg/pTrdZ3vN) [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@asterxsk) [![email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:itslace100@gmail.com) 

---
[![](https://visitcount.itsvg.in/api?id=asterxsk&icon=0&color=0)](https://visitcount.itsvg.in)

### Visit the live site: [asterxsk.github.io/CampusNodes](https://asterxsk.github.io/CampusNodes/)

### Features

*   **🛒 Campus Marketplace:** A dedicated platform for students to buy and sell textbooks, tech, and essentials.
*   **🛠️ Service Hub:** Find verified peer tutors, local printing services, and tech repairs.
*   **🤝 Connections & Trust:** Unique "Trust Score" system for verified students and safe trading.
*   **🎨 Immersive UI:**
    *   **3D Hero Scene:** Interactive 3D background with physics-based floating elements.
    *   **Custom Cursor:** Physics-driven cursor with lag, reactive scaling, and particle trails.
    *   **Exploding Buttons:** Dynamic interactions with massive doodle explosions on click.
*   **🔐 Secure Auth:** Full authentication system via Supabase using specific college domains.
*   **⚡ Blazing Fast:** Built on Vite + React for instant load times and interactions.

### Tech Stack

*   **Frontend Library:** [React](https://reactjs.org/) (v19)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend / Auth:** [Supabase](https://supabase.com/)
*   **3D Graphics:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) / [Drei](https://github.com/pmndrs/drei)
*   **Animations:** [Anime.js](https://animejs.com/)

### How to Build from Source

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/asterxsk/CampusNodes.git
    cd CampusNodes
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The site will be available at `http://localhost:5173`.

5.  **Build for Production**
    ```bash
    npm run build
    ```
