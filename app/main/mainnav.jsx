"use client"
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScroll = () => {
        setScrollPosition(window.scrollY);
    };

    return (
        <header
            className={`
                fixed top-0 w-full z-30 transition-all duration-500 ease-in-out 
                ${scrollPosition > 50 ? "bg-[#F1F4F9]" : "bg-[#F1F4F9]"}
            `}
        >
            <div className="flex justify-between mx-1 md:mx-5 h-16 max-w-screen-xl items-center xl:mx-auto">
                <Link href="/" passHref>
                    <div className="flex items-center font-display text-2xl cursor-pointer ">
                        <Image
                            src="/logo.png"
                            alt="N17R logo"
                            width="50"
                            height="50"
                            className="mr-2 rounded-sm"
                        />
                        <p className={`font-extrabold ${scrollPosition > 50 ? "text-[#111110]" : "text-[#111110]"} transition-colors duration-300`}>EmtihanAI</p>
                    </div>
                </Link>

                <nav className="flex space-x-4">
                    <div className="flex justify-center space-x-6 mr-4">
                        {[
                            { name: 'Вернуться на главную страницу', path: '/' }
                        ].map((item) => (
                            <Link href={item.path} passHref key={item.name}>
                                <button className={`text-[#111111] hover:bg-[#b2ebf2] transition-colors duration-300 py-2 px-4 rounded-lg font-semibold`}>
                                    {item.name}
                                </button>
                            </Link>
                        ))}
                       
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            className={`text-[#111110] transition-colors duration-300 py-2 px-3 rounded-lg bg-[#b2ebf2] flex items-center font-semibold`}
                        >
                            Язык
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 ml-1">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 w-40 mt-2 py-2 bg-[#F1F4F9] border rounded-lg shadow-xl transition-all duration-500 ease-in-out">
                                {['Русский', 'English', 'Қазақша'].map((lang) => (
                                    <button className="transition-colors duration-300 block px-4 py-2 cursor-pointer hover:bg-[#b2ebf2] w-full text-center text-[#006064] font-semibold" key={lang}>
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Image
                            src="/user.png"
                            width={40}
                            height={30}
                        />
                        <span>Yerdaulet D.</span>
                    </div>
                </nav>
            </div>
        </header>
    );
}
