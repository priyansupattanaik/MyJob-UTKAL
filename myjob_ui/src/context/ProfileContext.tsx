// ProfileContext.js
import React, { createContext, useState, useContext } from 'react';


interface WorkExperience {
    company: string;
    role: string;
    years: string;
}

interface Education {
    institution: string;
    degree: string;
    years: string;
}

interface ProfileContextProps {
    aboutMe: string;
    setAboutMe: (text: string) => void;
    workExperience: WorkExperience[];
    setWorkExperience: (experience: WorkExperience[]) => void;
    education: Education[];
    setEducation: (education: Education[]) => void;
    skills: string[];
    setSkills: (skills: string[]) => void;
    languages: string[];
    setLanguages: (languages: string[]) => void;
    appreciations: string[];
    setAppreciations: (appreciations: string[]) => void;
    resume: string | null;
    setResume: (resume: string | null) => void;
    selectedLanguage: string | null;
    setSelectedLanguage: (language: string) => void;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [aboutMe, setAboutMe] = useState<string>('Lorem ipsum dolor sit amet.');
    const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [appreciations, setAppreciations] = useState<string[]>([]);
    const [resume, setResume] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    return (
        <ProfileContext.Provider
            value={{
                aboutMe,
                setAboutMe,
                workExperience,
                setWorkExperience,
                education,
                setEducation,
                skills,
                setSkills,
                languages,
                setLanguages,
                appreciations,
                setAppreciations,
                resume,
                setResume,
                selectedLanguage,
                setSelectedLanguage,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return context;
};

