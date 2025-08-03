"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const SeedPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [seedLog, setSeedLog] = useState<string[]>([]);

  // Contratos
  const { writeContractAsync: writeEventManagerContract } = useScaffoldWriteContract({
    contractName: "EventManager",
  });

  const { writeContractAsync: writeCanjeManagerContract } = useScaffoldWriteContract({
    contractName: "CanjeManager",
  });

  // Mock data para eventos
  const mockEvents = [
    {
      recompensa: "150",
      title: "Limpieza de playa en Viña del Mar",
      description: "Actividad comunitaria para limpiar la playa de Viña del Mar de plásticos y residuos",
      longDescription:
        "Únete a esta actividad ambiental para ayudar a limpiar nuestra playa local. Trabajaremos juntos para recoger plásticos, colillas de cigarrillos y otros residuos que contaminan nuestro ecosistema marino. Se proporcionarán guantes y bolsas. ¡Trae tu entusiasmo y energía positiva!",
      imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1200&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1200&auto=format&fit=crop",
      date: "2025-08-15",
      location: "Playa de Reñaca, Viña del Mar",
      category: "Ambiental",
    },
    {
      recompensa: "120",
      title: "Taller de programación para niños",
      description: "Enseña programación básica a niños de comunidades vulnerables",
      longDescription:
        "En este taller, voluntarios con conocimientos en programación enseñarán conceptos básicos a niños de 8 a 12 años de comunidades vulnerables. Utilizaremos herramientas visuales como Scratch para introducir el pensamiento computacional de manera divertida y accesible. No se requiere experiencia previa en enseñanza, solo pasión por compartir conocimientos.",
      imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=1200&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=200&auto=format&fit=crop",
      date: "2025-09-10",
      location: "Centro Comunitario El Bosque, Santiago",
      category: "Educación",
    },
    {
      recompensa: "200",
      title: "Maratón solidaria por la salud mental",
      description: "Carrera de 5km para recaudar fondos para programas de salud mental",
      longDescription:
        "Esta maratón tiene como objetivo recaudar fondos para programas de apoyo en salud mental para jóvenes. Los voluntarios pueden participar como corredores, en puestos de hidratación, o en la organización general del evento. Necesitamos personas entusiastas que puedan ayudar a crear un ambiente positivo y motivador para todos los participantes.",
      imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1579126038374-6064e9370f0f?q=80&w=200&auto=format&fit=crop",
      date: "2025-10-05",
      location: "Parque Bicentenario, Santiago",
      category: "Salud",
    },
    {
      recompensa: "180",
      title: "Hackathon por la inclusión",
      description: "Desarrolla soluciones tecnológicas para personas con discapacidad",
      longDescription:
        "En este hackathon de 48 horas, equipos multidisciplinarios trabajarán para desarrollar soluciones tecnológicas que mejoren la calidad de vida de personas con discapacidad. Buscamos desarrolladores, diseñadores, y personas con conocimiento en accesibilidad. Las mejores soluciones recibirán financiamiento para su implementación en comunidades locales.",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop",
      date: "2025-11-20",
      location: "Campus San Joaquín, Universidad Católica",
      category: "Tecnología",
    },
    {
      recompensa: "130",
      title: "Construcción de huertos comunitarios",
      description: "Ayuda a crear huertos urbanos en barrios vulnerables",
      longDescription:
        "Este proyecto busca implementar huertos comunitarios en barrios con poco acceso a alimentos frescos. Los voluntarios participarán en la construcción de camas de cultivo, preparación de suelo, y plantación inicial. También capacitaremos a vecinos para el mantenimiento futuro. Es una excelente oportunidad para aprender sobre agricultura urbana y sostenibilidad.",
      imageUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1200&auto=format&fit=crop",
      logoUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=200&auto=format&fit=crop",
      date: "2025-09-25",
      location: "Villa Francia, Estación Central",
      category: "Comunitario",
    },
  ];

  // Mock data para recompensas
  const mockRewards = [
    {
      tokenCost: "10",
      title: "Curso Completo de Desarrollo Web",
      description: "Acceso a curso premium de HTML, CSS y JavaScript con certificación",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
      provider: "CodeAcademy Pro",
      category: "Cursos",
    },
    {
      tokenCost: "5",
      title: "Mentoría personalizada en Marketing Digital",
      description: "3 sesiones de 1 hora con expertos en marketing digital",
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop",
      provider: "Marketing Mentors",
      category: "Mentorías",
    },
    {
      tokenCost: "500",
      title: "Entrada VIP a Conferencia Tech Summit",
      description: "Acceso completo al evento más importante de tecnología del año",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop",
      provider: "Tech Summit Organization",
      category: "Experiencias",
    },
    {
      tokenCost: "150",
      title: "Suscripción Premium a Biblioteca Digital",
      description: "6 meses de acceso ilimitado a más de 10,000 libros digitales",
      imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
      provider: "Digital Library Plus",
      category: "Servicios",
    },
    {
      tokenCost: "400",
      title: "Kit de Desarrollo Sostenible",
      description: "Kit completo con productos eco-friendly para reducir tu huella de carbono",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop",
      provider: "EcoLife Store",
      category: "Productos",
    },
    {
      tokenCost: "350",
      title: "Certificación en Gestión de Proyectos",
      description: "Preparación y examen para certificación internacional en Project Management",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
      provider: "PM Certification Institute",
      category: "Certificaciones",
    },
  ];

  // Función para generar eventos mock
  const seedEvents = async () => {
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera primero.");
      return;
    }

    setIsLoadingEvents(true);
    setSeedLog(prev => [...prev, "📝 Iniciando creación de eventos..."]);

    try {
      for (const evento of mockEvents) {
        setSeedLog(prev => [...prev, `⏳ Creando evento: ${evento.title}`]);

        await writeEventManagerContract({
          functionName: "crearEvento",
          args: [
            parseEther(evento.recompensa),
            evento.title,
            evento.description,
            evento.longDescription,
            evento.imageUrl,
            evento.logoUrl,
            evento.date,
            evento.location,
            evento.category,
          ],
        });

        setSeedLog(prev => [...prev, `✅ Evento creado: ${evento.title}`]);
      }

      setSeedLog(prev => [...prev, "🎉 Todos los eventos han sido creados con éxito!"]);
    } catch (error) {
      console.error("Error al crear eventos mock:", error);
      setSeedLog(prev => [
        ...prev,
        `❌ Error al crear eventos: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Función para generar recompensas mock
  const seedRewards = async () => {
    if (!connectedAddress) {
      alert("Por favor, conecta tu billetera primero.");
      return;
    }

    setIsLoadingRewards(true);
    setSeedLog(prev => [...prev, "📝 Iniciando creación de recompensas..."]);

    try {
      for (const reward of mockRewards) {
        setSeedLog(prev => [...prev, `⏳ Creando recompensa: ${reward.title}`]);

        await writeCanjeManagerContract({
          functionName: "crearRecompensa",
          args: [
            parseEther(reward.tokenCost),
            reward.title,
            reward.description,
            reward.imageUrl,
            reward.provider,
            reward.category,
          ],
        });

        setSeedLog(prev => [...prev, `✅ Recompensa creada: ${reward.title}`]);
      }

      setSeedLog(prev => [...prev, "🎉 Todas las recompensas han sido creadas con éxito!"]);
    } catch (error) {
      console.error("Error al crear recompensas mock:", error);
      setSeedLog(prev => [
        ...prev,
        `❌ Error al crear recompensas: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      setIsLoadingRewards(false);
    }
  };

  // Función para limpiar los logs
  const clearLogs = () => {
    setSeedLog([]);
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Seed Data</h1>
      <p className="text-center mb-8">Rellena la aplicación con datos de ejemplo para pruebas</p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="card bg-base-100 flex-1">
          <div className="card-body">
            <h2 className="card-title">Eventos</h2>
            <p className="mb-4">Crea 5 eventos de ejemplo con diferentes categorías y detalles.</p>
            <button className="btn btn-primary" onClick={seedEvents} disabled={isLoadingEvents}>
              {isLoadingEvents ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creando Eventos...
                </>
              ) : (
                "Crear Eventos de Ejemplo"
              )}
            </button>
          </div>
        </div>

        <div className="card bg-base-100 flex-1">
          <div className="card-body">
            <h2 className="card-title">Recompensas</h2>
            <p className="mb-4">Crea 6 recompensas de ejemplo para el marketplace con diferentes categorías.</p>
            <button className="btn btn-primary" onClick={seedRewards} disabled={isLoadingRewards}>
              {isLoadingRewards ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creando Recompensas...
                </>
              ) : (
                "Crear Recompensas de Ejemplo"
              )}
            </button>
          </div>
        </div>
      </div>

      {seedLog.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Log de Creación</h2>
              <button className="btn btn-sm btn-ghost" onClick={clearLogs}>
                Limpiar
              </button>
            </div>
            <div className="bg-base-300 p-4 rounded-lg h-64 overflow-auto">
              {seedLog.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-sm">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-base-200 rounded-lg">
        <h3 className="font-bold mb-2">⚠️ Importante</h3>
        <p>
          Esta página es solo para propósitos de desarrollo. Los datos creados son ejemplos y pueden ser utilizados para
          probar la funcionalidad de la aplicación. Asegúrate de estar conectado a una red de prueba.
        </p>
      </div>
    </div>
  );
};

export default SeedPage;
