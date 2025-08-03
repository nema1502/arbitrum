"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CalendarIcon, MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ResponsiveGrid } from "~~/components/ResponsiveGrid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export type EventType = {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  logoUrl: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
};
// Mock events data
const MOCK_EVENTS: EventType[] = [
  {
    id: 1,
    title: "Community Cleanup Day",
    description: "Join us for a day of cleaning up the local park and surrounding areas.",
    imageUrl: "https://placehold.co/1200x600/3b82f6/ffffff?text=Community+Cleanup+Day",
    date: "2025-08-15",
    logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",

    location: "Central Park",
    attendees: 45,
    category: "Environmental",
  },
  {
    id: 2,
    title: "Tech Workshop: Blockchain Basics",
    description: "Learn the fundamentals of blockchain technology and how it's changing the world.",
    imageUrl: "https://placehold.co/1200x600/10b981/ffffff?text=Blockchain+Workshop",
    logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",

    date: "2025-08-20",
    location: "Tech Hub Downtown",
    attendees: 120,
    category: "Education",
  },
  {
    id: 3,
    title: "Charity Run for Education",
    description: "5K run to raise funds for local schools and educational programs.",
    imageUrl: "https://placehold.co/1200x600/ef4444/ffffff?text=Charity+Run",
    logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",

    date: "2025-09-05",
    location: "Riverside Track",
    attendees: 230,
    category: "Fundraising",
  },
  {
    id: 4,
    title: "Community Garden Planting",
    description: "Help plant new trees and flowers in our community garden.",
    imageUrl: "https://placehold.co/1200x600/f59e0b/ffffff?text=Garden+Planting",
    logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",

    date: "2025-09-12",
    location: "Community Garden",
    attendees: 78,
    category: "Environmental",
  },
  {
    id: 5,
    title: "Local Business Fair",
    description: "Support local businesses and entrepreneurs at our annual fair.",
    imageUrl: "https://placehold.co/1200x600/8b5cf6/ffffff?text=Business+Fair",
    logoUrl: "https://placehold.co/200x200/3b82f6/ffffff?text=Logo",

    date: "2025-09-25",
    location: "Town Square",
    attendees: 350,
    category: "Community",
  },
];

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  console.log(connectedAddress);
  const [currentSlide, setCurrentSlide] = useState(0);

  const solicitudEventos = useScaffoldReadContract({
    contractName: "EventManager",
    functionName: "obtenerTodosLosEventos",
  });

  console.log(solicitudEventos.data);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % MOCK_EVENTS.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % MOCK_EVENTS.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + MOCK_EVENTS.length) % MOCK_EVENTS.length);
  };

  return (
    <>
      <div className="flex flex-col items-center">
        {/* Carousel section - 70vh height */}
        <div className="relative w-full h-[70vh] overflow-hidden">
          {/* Carousel slides */}
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="min-w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100vw"
                  priority={event.id === 1}
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full md:w-2/3">
                  <h2 className="text-4xl font-bold mb-2">{event.title}</h2>
                  <p className="text-lg mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      <span>{event.attendees} participants</span>
                    </div>
                  </div>
                  <Link href={`/eventos/${event.id}`}>
                    <button className="btn btn-primary">Learn More</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-30"
            onClick={prevSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-30"
            onClick={nextSlide}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Dots navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {MOCK_EVENTS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Featured events section */}
        <div className="flex flex-col w-full items-center justify-center px-4 py-8">
          <div className="w-full flex max-w-screen-2xl flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Events</h2>
            <ResponsiveGrid>
              {MOCK_EVENTS.map(event => (
                <div key={event.id} className="card bg-base-100 shadow-xl">
                  <figure className="h-48 relative">
                    <Image src={event.imageUrl} unoptimized alt={event.title} fill className="object-cover" />
                  </figure>
                  <div className="card-body">
                    <div className="badge badge-secondary mb-2">{event.category}</div>
                    <h3 className="card-title">{event.title}</h3>
                    <p className="line-clamp-2">{event.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">{event.attendees}</span>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <Link href={`/eventos/${event.id}`}>
                        <button className="btn btn-primary btn-sm">View Details</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
            <div className="text-center mt-10">
              <Link href="/eventos">
                <button className="btn btn-outline btn-lg">View All Events</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
