import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getStatsOverview, getTopPlayers, getNationalities, getPositions } from "../services/api";

import FlagIcon from "../components/FlagIcon";

// Animation d'apparition au scroll
function Section({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start({ opacity: 1, y: 0 });
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-20"
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overview, players, nats, poss] = await Promise.all([
        getStatsOverview(),
        getTopPlayers("finishing", null, 6),

        //  5 nationalités
        getNationalities(5),
        getPositions(),
      ]);

      setStats(overview);
      setTopPlayers(players);
      setNationalities(nats);
      setPositions(poss.slice(0, 10));
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-16 px-6 max-w-7xl mx-auto"
    >
      {/* Section d'accueil principale */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-20"
      >
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold text-gray-800 mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ⚽ Bienvenue sur <span className="text-blue-600">SokrStat</span>
        </motion.h1>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-2">
          Explorez les données de <strong>Football Manager 2023</strong> avec plus de <strong>90 000 joueurs</strong> du monde entier.
        </p>
        <p className="text-gray-500 text-sm max-w-2xl mx-auto">
          Statistiques détaillées • Comparaisons • Visualisations interactives
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/players"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg"
          >
            Explorer les joueurs
          </Link>
          <Link
            to="/compare"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold shadow-lg"
          >
            Comparer des joueurs
          </Link>
        </div>
      </motion.section>

      {/* Statistiques globales */}
      {stats && (
        <Section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard
              value={stats.total_players?.toLocaleString()}
              label="Joueurs"
              color="blue"
            />
            <StatCard
              value={stats.nationalities}
              label="Nationalités"
              color="green"
            />
            <StatCard
              value={stats.clubs}
              label="Clubs"
              color="purple"
            />
            <StatCard
              value={stats.average_age?.toFixed(1)}
              label="Âge moyen"
              color="yellow"
            />
          </div>
        </Section>
      )}

      {/* Top joueurs */}
      <Section>
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
           Top Finisseurs
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPlayers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/player/${p.id}`}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 block border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{p.name}</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      {p.value}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{p.club || "Sans club"}</p>
                    <p className="flex items-center gap-2">
                      <FlagIcon countryCode={p.nationality} />
                      {p.nationality}
                    </p>
                    <p>{p.position}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/players"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Voir tous les joueurs →
          </Link>
        </div>
      </Section>

      {/* Graphiques de distribution */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top nationalités */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Top 5 Nationalités
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nationalities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nationality" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top positions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Répartition par Position
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={positions}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                
                <XAxis type="number" />
                
                <YAxis 
                  dataKey="position" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 11 }} 
                  interval={0} 
                />
                
                <Tooltip />
                
                <Bar dataKey="count">
                  {positions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </Section>

      {/* Fonctionnalités */}
      <Section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
           Fonctionnalités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Recherche Avancée"
            description="Filtrez par position, nationalité, club, âge et plus encore."
            link="/players"
           />
          <FeatureCard
            title="Comparateur"
            description="Comparez jusqu'à 4 joueurs côte à côte avec graphiques radar."
            link="/compare"
          />
          <FeatureCard
            title="Statistiques Détaillées"
            description="Consultez les attributs techniques, mentaux et physiques de chaque joueur."
            link="/players"
          />
        </div>
      </Section>

      {/* À propos du projet */}
      <Section>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
             À propos du projet
          </h2>
          <p className="max-w-3xl mx-auto mb-4 leading-relaxed text-white/90">
            <strong>SokrStat</strong> est un projet académique réalisé dans le cadre du parcours
            <strong> DSI (Data et Sécurité Informatique) à l'ISFA - Lyon 1</strong>. 
            Il combine la <strong>visualisation de données</strong>, l'<strong>analyse statistique</strong> et le <strong>développement web full stack</strong> pour explorer les données de Football Manager 2023.
          </p>

          <div className="flex justify-center gap-3 flex-wrap mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
               Flask (API REST)
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
               React + Vite
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
               TailwindCSS
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
               SQLite + SQLAlchemy
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
               Recharts
            </span>
        </div>

          <p className="mt-6 text-sm text-white/80">
             Dataset : Football Manager 2023 (90k+ joueurs) de Kaggle
          </p>
        </div>
      </Section>

      {/* Copyright */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Kennedy NGOKIA</span> - SokrStat • Projet LCAD - ISFA Lyon 1
        </p>
      </div>
    </motion.div>
  );
}

// Composant carte statistique
function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-6 text-white text-center`}
>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </motion.div>
  );
}

// Composant carte fonctionnalité
function FeatureCard({ icon, title, description, link }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
     <Link
        to={link}
        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
      >
        Découvrir →
      </Link>
    </motion.div>
  );
}