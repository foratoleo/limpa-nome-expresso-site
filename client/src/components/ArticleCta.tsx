import { motion } from "framer-motion";
import { Link } from "wouter";

export function ArticleCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
      className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        border: "1px solid #d39e17",
      }}
    >
      <h2
        className="font-bold text-2xl leading-tight"
        style={{ color: "#d39e17" }}
      >
        Quer resolver sua situação?
      </h2>

      <p
        className="text-base leading-relaxed max-w-lg"
        style={{ color: "#94a3b8" }}
      >
        Milhares de brasileiros já limparam o nome usando o Juizado Especial
        Cível, sem advogado e sem pagar nada adiantado.
      </p>

      <Link href="/">
        <motion.span
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block mt-2 px-8 py-3 rounded-xl font-bold text-base cursor-pointer w-full sm:w-auto text-center"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          Comece Agora Gratuitamente
        </motion.span>
      </Link>
    </motion.div>
  );
}

export default ArticleCta;
