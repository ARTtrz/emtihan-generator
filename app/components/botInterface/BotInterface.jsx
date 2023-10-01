"use client"
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import CustomTextField from './CustomTextField';
import html2pdf from 'html2pdf.js';
import MathJax from 'react-mathjax2';
import katex from 'katex';
import SubjectSelect from './SubjectSelect';
import ClassSelect from './ClassSelect';
import QuarterSelect from './QuarterSelect';
import TopicSelect from './TopicSelect';
import GeneratedTasks from './GeneratedTasks';
import * as MUI from '@mui/material';

const BotInterface = ({ classData }) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [generatedTasks, setGeneratedTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState({});
    const [topic, setTopic] = useState('');
    const [learningObjective, setLearningObjective] = useState('');
    const [evaluationCriteria, setEvaluationCriteria] = useState('');
    const [thinkingSkillsLevel, setThinkingSkillsLevel] = useState('');
    const [completionTime, setCompletionTime] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [descriptors, setDescriptors] = useState(null);
    const [descriptorLoading, setDescriptorLoading] = useState(false);
    const [isInfoVisible, setInfoVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setInfoVisible(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    
    const parseLaTeX = (input) => {
        console.log(input, 'HEEEEEELLLO')
        const regex = /\$(.*?)\$/g;
        const parts = input.split(regex);

        return (
            <MathJax.Context input='tex'>
                <>
                    {parts.map((part, index) => {
                        if (index % 2 === 0) return part;
                        return <MathJax.Node key={index} inline>{part}</MathJax.Node>;
                    })}
                </>
            </MathJax.Context>
        );
    };

    const generateHtmlForPdf = (data) => {
        const tasksHtml = data.tasks.map((task, index) => {
            const taskHtml = task.replace(/\$\s*(.*?)\s*\$/g, (match, latex) => {
                const html = katex.renderToString(latex);
                return html;
            });
            return `<p style="margin-bottom: 0.1in;">${index + 1}. ${taskHtml}</p>`;
        }).join('');

        return `

        <div style="margin-left: 1in; margin-right: 1in;">
            ${tasksHtml}
            <div style="margin-bottom: 0.2in;"></div>
        </div>
        `;
    };

    const downloadPdf = () => {
        const data = {
            customTitle: customTitle,
            topic: topic,
            learningObjective: learningObjective,
            evaluationCriteria: evaluationCriteria,
            thinkingSkillsLevel: thinkingSkillsLevel,
            completionTime: completionTime,
            tasks: handleDownload(),
        };
        const html = generateHtmlForPdf(data);
        const opt = {
            margin: 0,
            filename: 'Задачи.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' }
        };
        html2pdf().from(html).set(opt).save();
    };

    const handleTaskSelect = async (topicIndex, taskIndex) => {
        let newSelectedTasks = { ...selectedTasks };

        if (!newSelectedTasks[topicIndex]) {
            newSelectedTasks[topicIndex] = new Set([taskIndex]);
        } else if (newSelectedTasks[topicIndex].has(taskIndex)) {
            newSelectedTasks[topicIndex] = new Set(
                Array.from(newSelectedTasks[topicIndex]).filter(index => index !== taskIndex)
            );
        } else {
            newSelectedTasks[topicIndex].add(taskIndex);
        }

        setSelectedTasks(newSelectedTasks);
    };

    const handleCustomTitleChange = (e) => {
        setCustomTitle(e.target.value);
    };

    const handleDownload = () => {
        let tasksForDownload = [];
        for (const topicIndex in selectedTasks) {
            if (selectedTasks[topicIndex]?.size > 0) {
                for (const taskIndex of selectedTasks[topicIndex]) {
                    let task = generatedTasks[topicIndex].tasks[taskIndex];
                    task = task.replace(/<\/?br\/?>/g, '\n');
                    tasksForDownload.push(task);
                }
            }
        }
        return tasksForDownload;
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const allTasks = [];
            for (let topic of selectedTopics) {
                const response = await axios.post('/api/chat', {
                    selectedSubject,
                    selectedClass,
                    selectedQuarter,
                    selectedTopics: topic,
                });
                console.log(response, 'res')
                allTasks.push({ topic, tasks: [response.data] });
            }
            setGeneratedTasks(allTasks);
            if (allTasks.length > 0) {
                handleDescriptors();
            }
        } catch (error) {
            console.log("DAAAAAMN")
            console.error("Error fetching data from ChatGPT API:", error);
        }
        setLoading(false);

    };

    const handleDescriptors = async () => {
        setDescriptorLoading(true);
        const allDescriptors = [];
        
        console.log(allDescriptors, 'Descriptors')
        setDescriptors(allDescriptors);
        setDescriptorLoading(false);
    };

    useEffect(() => {
        handleDescriptors(generatedTasks);
    }, [generatedTasks]);

    const handleAppend = async () => {
        setLoading(true);
        try {
            const allTasks = [];
            for (let topic of selectedTopics) {
                const response = await axios.post('/api/chat', {
                    selectedSubject,
                    selectedClass,
                    selectedQuarter,
                    selectedTopics: topic,
                });
                allTasks.push({ topic, tasks: [response.data] });
            }
            setGeneratedTasks([...generatedTasks, ...allTasks]);
            if (allTasks.length > 0) {
                handleDescriptors();
            }
        } catch (error) {
            console.error("Error fetching data from ChatGPT API:", error);
        }
        setLoading(false);
    };

    const handleReset = () => {
        setSelectedSubject('');
        setSelectedClass('');
        setSelectedQuarter('');
        setSelectedTopics([]);
        setGeneratedTasks([]);
    };

    const changeSubject = (subject) => {
        setSelectedSubject(subject);
        setSelectedClass('');
        setSelectedQuarter('');
        setSelectedTopics([]);
    };

    const changeClass = (classNumber) => {
        setSelectedClass(classNumber);
        setSelectedQuarter('');
        setSelectedTopics([]);
    };

    const changeQuarter = (quarter) => {
        setSelectedQuarter(quarter);
        setSelectedTopics([]);
    };

    return (
        <div className="h-screen pt-14 flex bg-gray-100">
            <div className="w-1/4 h-full p-6 bg-white shadow-md overflow-y-auto">
                <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                    <div className="mb-4">
                        <SubjectSelect
                            classData={classData}
                            selectedSubject={selectedSubject}
                            setSelectedSubject={setSelectedSubject}
                            changeSubject={changeSubject}
                        />
                    </div>
                </MUI.Slide>

                {selectedSubject && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div className="mb-4">
                            <ClassSelect
                                classData={classData}
                                selectedSubject={selectedSubject}
                                selectedClass={selectedClass}
                                setSelectedClass={setSelectedClass}
                                changeClass={changeClass}
                            />
                        </div>
                    </MUI.Slide>
                )}
{/* 
                {selectedClass && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div className="mb-4">
                            <QuarterSelect
                                classData={classData}
                                selectedSubject={selectedSubject}
                                selectedClass={selectedClass}
                                selectedQuarter={selectedQuarter}
                                setSelectedQuarter={setSelectedQuarter}
                                changeQuarter={changeQuarter}
                            />
                        </div>
                    </MUI.Slide>
                )} */}

                {selectedClass && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div className="mb-4">
                            <TopicSelect
                                classData={classData}
                                selectedSubject={selectedSubject}
                                selectedClass={selectedClass}
                                selectedQuarter={selectedQuarter}
                                selectedTopics={selectedTopics}
                                setSelectedTopics={setSelectedTopics}
                            />
                        </div>
                    </MUI.Slide>
                )}

                {selectedTopics && selectedTopics.length > 0 && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div className="mt-6 space-y-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || selectedTopics.length === 0}
                                className="w-full py-2 text-xl font-semibold rounded-lg shadow-lg text-white bg-blue-500 hover:bg-blue-600 transition duration-300"
                            >
                                {loading ? 'Создание задач...' : 'Создать задания на выбранные темы'}
                            </button>
                            <div className="flex justify-between space-x-2">
                                <button
                                    onClick={handleAppend}
                                    disabled={loading || selectedTopics.length === 0 || generatedTasks.length === 0}
                                    className="w-1/2 py-2 font-semibold rounded-lg shadow-lg text-white bg-green-500 hover:bg-green-600 transition duration-300"
                                >
                                    {loading ? 'Добавление заданий...' : 'Добавить еще заданий'}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-1/2 py-2 font-semibold rounded-lg shadow-lg text-white bg-purple-500 hover:bg-purple-600 transition duration-300"
                                >
                                    Обновить
                                </button>
                            </div>
                        </div>
                    </MUI.Slide>
                )}
            </div>

            <div className="flex-1 h-full p-8 overflow-auto"
                style={generatedTasks && generatedTasks.length > 0
                    ? {}
                    : {
                        backgroundColor: "#ffffff",
                        opacity: "0.5",
                        backgroundImage: 'linear-gradient(#9090b9 0.8px, transparent 0.8px), linear-gradient(90deg, #9090b9 0.8px, transparent 0.8px), linear-gradient(#9090b9 0.4px, transparent 0.4px), linear-gradient(90deg, #9090b9 0.4px, #ffffff 0.4px)',
                        backgroundSize: '20px 20px, 20px 20px, 4px 4px, 4px 4px',
                        backgroundPosition: '-0.8px -0.8px, -0.8px -0.8px, -0.4px -0.4px, -0.4px -0.4px',
                    }
                }
            >
                {

                    generatedTasks && generatedTasks.length > 0 && descriptors != null && (
                        <div className="flex-1 h-full p-8 overflow-auto bg-white">
                            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                                <h2 className="text-2xl font-bold mb-4">Вот ваши задачи:</h2>
                                <div id="pdfContent">
                                    <GeneratedTasks
                                        generatedTasks={generatedTasks}
                                        selectedTasks={selectedTasks}
                                        handleTaskSelect={handleTaskSelect}
                                        parseLaTeX={parseLaTeX}
                                    />
                                </div>
                                <button
                                    onClick={downloadPdf}
                                    className={`py-2 px-4 font-semibold text-white rounded-lg shadow-md hover:bg-blue-700 ${learningObjective ? 'bg-blue-500' : 'bg-blue-300 cursor-not-allowed'
                                        }`}
                                >
                                    Download PDF
                                </button>
                                {descriptorLoading ? (
                                    <div className="text-center mt-4">
                                        <h2 className="text-lg font-bold">Дескрипторы генерируются...</h2>
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 m-auto"></div>
                                    </div>
                                ) : (
                                    <div>
                                        <ol>
                                            {descriptors.map((descriptor, index) => (
                                                <li className='' key={index}>
                                                    <h3 className="pl-6 align-middle" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '20px' }}>{index + 1 + " задание"}: {parseLaTeX(descriptor.descriptor[0])}</h3>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            </div>
            {/* <div className="w-1/4 h-full p-6 bg-white shadow-md overflow-y-auto" ref={containerRef}>
                {!isInfoVisible && (
                    <button
                        onClick={() => setInfoVisible(true)}
                        className="text-blue-500 text-xl hover:underline mb-2">
                        Что за меню ниже?
                    </button>
                )}

                {isInfoVisible && (
                    <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-md relative">
                        <span
                            className="absolute top-0 right-0 bg-white rounded-full p-1 cursor-pointer text-sm leading-none text-gray-500 hover:text-gray-700 -mt-3 -mr-3"
                            onClick={() => setInfoVisible(false)}>
                            ✖
                        </span>
                        <p className="text-lg font-semibold mb-4">
                            Данное меню отвечает за создание информирующей таблицы для СОРов и СОЧей.
                            Заполните данные ниже для того чтобы начальная таблица СОРа или СОЧа была заполнена вашими данными.
                            Меню будет дополняться по мере заполнения данных. Не волнуйтесь и просто следуйте инструкциям.
                        </p>
                    </div>
                )}
                <CustomTextField
                    title="Создаем СОР или СОЧ?"
                    placeholder="Введите тип проверки знаний, к примеру Суммативное оценивание за раздел"
                    value={customTitle}
                    onChange={handleCustomTitleChange}
                />
                <MUI.Slide direction="down" in={customTitle.length > 0}>
                    <div>
                        <CustomTextField
                            title="Тема данного СОРа или СОЧа"
                            placeholder="Введите тему"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                </MUI.Slide>
                <MUI.Slide direction="down" in={topic.length > 0}>
                    <div>
                        <CustomTextField
                            title="Впишите цели обучения"
                            placeholder="Цели обучения"
                            value={learningObjective}
                            onChange={(e) => setLearningObjective(e.target.value)}
                        />
                    </div>
                </MUI.Slide>
                <MUI.Slide direction="down" in={learningObjective.length > 0}>
                    <div>
                        <CustomTextField
                            title="Критерий оценивания"
                            placeholder="Введите критерий оценивания"
                            value={evaluationCriteria}
                            onChange={(e) => setEvaluationCriteria(e.target.value)}
                        />
                    </div>
                </MUI.Slide>
                <MUI.Slide direction="down" in={evaluationCriteria.length > 0}>
                    <div>
                        <CustomTextField
                            title="Уровень мыслительных навыков"
                            placeholder="Введите уровень мыслительных навыков"
                            value={thinkingSkillsLevel}
                            onChange={(e) => setThinkingSkillsLevel(e.target.value)}
                        />
                    </div>
                </MUI.Slide>
                <MUI.Slide direction="down" in={thinkingSkillsLevel.length > 0}>
                    <div>
                        <CustomTextField
                            title="Время выполнения"
                            placeholder="Введите время выполнения"
                            value={completionTime}
                            onChange={(e) => setCompletionTime(e.target.value)}
                        />
                    </div>
                </MUI.Slide>
            </div> */}
        </div >
    );
};

export default BotInterface;