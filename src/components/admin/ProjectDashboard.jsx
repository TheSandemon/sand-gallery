import React from 'react';
import useProjects from '../../hooks/useProjects';

const ProjectDashboard = () => {
    const { projects, loading } = useProjects();

    return (
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white uppercase tracking-tighter">
                Project <span className="text-neon-gold">Command Center</span>
            </h2>

            {loading ? (
                <p className="text-gray-500 animate-pulse">Scanning infrastructure...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                        <div key={project.id} className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-neon-green/30 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-white group-hover:text-neon-green transition-colors">
                                    {project.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-snug">
                                {project.description}
                            </p>
                            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                <span>ROI: {project.revenue || '$0.00'}</span>
                                <span>Updated: {project.lastUpdated?.toDate ? project.lastUpdated.toDate().toLocaleDateString() : 'Unknown'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;
