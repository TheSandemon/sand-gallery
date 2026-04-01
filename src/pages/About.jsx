import React from 'react';

const SKILLS = [
    { name: 'Creative Direction', level: 95 },
    { name: 'Video Production', level: 90 },
    { name: 'Audio Design', level: 85 },
    { name: 'Web Development', level: 80 },
    { name: '3D Modeling', level: 75 },
    { name: 'Game Design', level: 70 },
];

const About = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        ABOUT
                    </h1>
                    <div className="w-24 h-1 bg-neon-green mb-8" />
                </div>

                {/* Bio */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <p className="text-xl text-gray-300 leading-relaxed mb-6">
                            I'm a multidisciplinary creative focused on pushing the boundaries of digital experiences.
                            My work spans across visual arts, audio design, and interactive media.
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            Based in the intersection of technology and creativity, I explore new ways
                            to tell stories and create immersive experiences. Every project is an
                            opportunity to experiment and push creative limits.
                        </p>
                    </div>
                    <div className="bg-[#111] rounded-lg p-8">
                        <h3 className="text-white font-bold mb-6 text-lg">QUICK FACTS</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex justify-between">
                                <span>Location</span>
                                <span className="text-white">Digital Space</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Focus</span>
                                <span className="text-white">Multimedia</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Since</span>
                                <span className="text-white">2020</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Status</span>
                                <span className="text-neon-green">Available</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8">SKILLS</h2>
                    <div className="space-y-6">
                        {SKILLS.map(skill => (
                            <div key={skill.name}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-300">{skill.name}</span>
                                    <span className="text-gray-500">{skill.level}%</span>
                                </div>
                                <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-neon-green rounded-full transition-all duration-1000"
                                        style={{ width: `${skill.level}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Philosophy */}
                <div className="bg-[#111] rounded-lg p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-white mb-6">PHILOSOPHY</h2>
                    <blockquote className="text-2xl text-gray-300 italic leading-relaxed border-l-4 border-neon-green pl-6">
                        "The best creative work happens at the edge of comfort and chaos.
                        I strive to create experiences that resonate emotionally while
                        challenging conventions."
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default About;
