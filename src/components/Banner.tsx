import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { ShootingStars } from "./ui/shadcn-io/shooting-stars";

function Banner() {
  const text = ["A", "Stunning", "Satellite", "Visualizer"];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 90; // offset for sticky header
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const word = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 220, damping: 18 },
    },
  };

  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center">

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#001219] via-[#003566] to-[#0A9396]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="stars absolute inset-0 opacity-80" />
       
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -bottom-44 -right-44 h-[560px] w-[560px] rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <ShootingStars starColor="white" className="absolute inset-0" />

      <div className="relative z-10 px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            inline-flex items-center gap-2 rounded-full
            border border-white/10 bg-white/5 backdrop-blur-xl
            px-4 py-2 text-sm text-white/80
            shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          "
        >
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.8)]" />
          Real-time orbit vibes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="
            mt-6 text-4xl md:text-6xl font-extrabold tracking-tight
            text-transparent bg-clip-text
            bg-linear-to-r from-white via-amber-200 to-emerald-200
            drop-shadow-[0_12px_40px_rgba(0,0,0,0.35)]
          "
        >
          Explore Space, Live.
        </motion.h1>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-wrap justify-center gap-3 md:gap-4"
        >
          {text.map((item) => (
            <motion.div
              key={item}
              variants={word}
              whileHover={{ y: -6, scale: 1.02 }}
              className="
                group cursor-default select-none
                rounded-2xl px-4 py-3
                border border-white/10 bg-white/5 backdrop-blur-xl
                shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                transition
              "
            >
              <span
                className="
                  text-white text-2xl md:text-4xl font-semibold
                  group-hover:text-amber-200 transition
                "
              >
                {item}
              </span>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-amber-400/40 via-white/10 to-emerald-300/25 blur-md" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-5 text-white/70 max-w-2xl mx-auto"
        >
          Paste a TLE source, watch satellites move, and click any entry to focus the map.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-3"
      >
        <div className="text-xs text-white/70 tracking-wide">Scroll</div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          >
            <div className="h-16 w-16 rounded-full border border-amber-300/60" />
          </motion.div>

          <div className="h-16 w-16 rounded-full bg-linear-to-r from-amber-300 to-amber-400 shadow-[0_12px_35px_rgba(245,158,11,0.25)] border border-white/15 backdrop-blur-xl flex items-center justify-center">
            <Button
              disableRipple
              className="rounded-full! min-w-0! w-16 h-16"
              onClick={() => scrollToSection("visualizer")}
            >
              <KeyboardArrowDownIcon className="text-black" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Banner;
