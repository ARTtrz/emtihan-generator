"use client"
import React, { useEffect, useState } from 'react';
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
import { Box, Button, TextField, Typography, Paper, styled } from '@mui/material';
import { Scrollbar } from 'react-scrollbars-custom';
import CircularProgress from '@mui/material/CircularProgress';


const CustomScrollbar = styled(Scrollbar)({
    '& .ScrollbarsCustom-TrackY': {
        backgroundColor: '#e0f7fa',
        width: '8px',
        right: '0',
    },
    '& .ScrollbarsCustom-ThumbY': {
        backgroundColor: '#80deea',
    },
});

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

    const parseLaTeX = (input) => {
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
        <div style="text-align: center; font-size: 1.2em; font-weight: bold; margin-top: 0.5in;">${data.customTitle}</div>
        <div style="width: 80%; display: flex; justify-content: space-between; margin-top: 0.3in; margin-left: 0.80in; margin-right: 0.40in; font-size: 0.8em;">
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <div>Имя_____________</div>
                <div>Фамилия_______________</div>
            </div>
            <div>Класс_____</div>
        </div>
        <table style="width: 80%; margin: 0.4in auto; border: 1px solid #e0e0e0; text-align: left; font-size: 0.8em; border-collapse: collapse;">
            <colgroup>
                <col style="width: 10%">
                <col style="width: 90%">
            </colgroup>
            <tr>
                <th style="border: 1px solid #e0e0e0; padding: 0.1in;">Тема:</th>
                <td style="border: 1px solid #e0e0e0; padding: 0.1in;">${data.topic}</td>
            </tr>
            <tr>
                <th style="border: 1px solid #e0e0e0; padding: 0.1in;">Цель обучения:</th>
                <td style="border: 1px solid #e0e0e0; padding: 0.1in;">${data.learningObjective}</td>
            </tr>
            <tr>
                <th style="border: 1px solid #e0e0e0; padding: 0.1in;">Критерий оценивания:</th>
                <td style="border: 1px solid #e0e0e0; padding: 0.1in;">${data.evaluationCriteria}</td>
            </tr>
            <tr>
                <th style="border: 1px solid #e0e0e0; padding: 0.1in;">Уровень мыслительных навыков:</th>
                <td style="border: 1px solid #e0e0e0; padding: 0.1in;">${data.thinkingSkillsLevel}</td>
            </tr>
            <tr>
                <th style="border: 1px solid #e0e0e0; padding: 0.1in;">Время выполнения:</th>
                <td style="border: 1px solid #e0e0e0; padding: 0.1in;">${data.completionTime}</td>
            </tr>
        </table>
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
                    selectedTopic: topic,
                });
                allTasks.push({ topic, tasks: [response.data] });
            }
            setGeneratedTasks(allTasks);
            if (allTasks.length > 0) {
                handleDescriptors();
            }
        } catch (error) {
            console.error("Error fetching data from ChatGPT API:", error);
        }
        setLoading(false);
    };

    const handleDescriptors = async () => {
        setDescriptorLoading(true);
        try {
            const allDescriptors = [];
            for (let task of generatedTasks) {
                const response = await axios.post('/api/chatDescriptors', {
                    task,
                });
                allDescriptors.push({ task, descriptor: [response.data] });
            }
            setDescriptors(allDescriptors);
        } catch (error) {
            console.error("Error fetching descriptors from API:", error);
            setDescriptors([]);
        }
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
                    topic,
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
        <div className="h-screen pt-14 flex bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white" >
            <div className="w-1/4 h-full p-8 sticky top-0 overflow-auto bg-gradient-to-r from-purple-300 via-purple-300 to-purple-400 bg-opacity-50 text-white">
                <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                    <div>
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
                        <div>
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

                {selectedClass && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div>
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
                )}

                {selectedQuarter && (
                    <MUI.Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <div>
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

                <div className="mt-6 flex flex-col space-y-4">
                    <motion.button
                        onClick={handleGenerate}
                        disabled={loading || selectedTopics.length === 0}
                        className="w-full py-2 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {loading ? 'Создание...' : 'Создать'}
                    </motion.button>

                    <div className="flex justify-between">
                        <motion.button
                            onClick={handleAppend}
                            disabled={loading || selectedTopics.length === 0 || generatedTasks.length === 0}
                            className="w-1/2 py-2 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700 mr-2"
                            whileHover={{ scale: 1.09 }}
                            transition={{ duration: 0.2 }}
                        >
                            {loading ? 'Добавление...' : 'Добавить'}
                        </motion.button>

                        <motion.button
                            onClick={handleReset}
                            className="w-1/2 py-2 font-semibold rounded-lg shadow-md text-white bg-gray-800 hover:bg-gray-600 ml-2"
                            whileHover={{ scale: 1.09 }}
                            transition={{ duration: 0.2 }}
                        >
                            Главное меню
                        </motion.button>
                    </div>
                </div>
            </div>
            {
                generatedTasks && generatedTasks.length > 0 && descriptors !== null ? (
                    <div className="flex-1 h-full p-8 overflow-auto bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        <div className="bg-white p-8 rounded shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Сгенерированные задачи:</h2>
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
                                className={`py-2 px-4 mt-4 font-semibold text-white rounded-lg shadow-md hover:bg-blue-700 ${learningObjective ? 'bg-blue-500' : 'bg-blue-300 cursor-not-allowed'
                                    }`}
                            >
                                Download PDF
                            </button>

                            {descriptors.length > 0 ? (
                                <div>
                                    <ol>
                                        {descriptors.map((descriptor, index) => (
                                            <li className='' key={index}>
                                                <h3 className="pl-6 align-middle text-black" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '20px' }}>
                                                    {index + 1 + " задание"}: {parseLaTeX(descriptor.descriptor[0])}
                                                </h3>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ) : (
                                // Show the message if descriptors are empty
                                <div className="text-black font-semibold mt-4">Дескрипторы пока не сгенерированы.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Show the Generate button and PDF download button when descriptors are null
                    <div className="flex-1 h-full p-8 overflow-auto bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        <div className="bg-white p-8 rounded shadow-lg">
                            <h2 className="text-black text-2xl font-bold mb-4">Сгенерированные задачи:</h2>
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
                                className={`py-2 px-4 mt-4 font-semibold text-white rounded-lg shadow-md hover:bg-blue-700 ${learningObjective ? 'bg-blue-500' : 'bg-blue-300 cursor-not-allowed'
                                    }`}
                            >
                                Скачать PDF файл
                            </button>
                        </div>
                    </div>
                )
            }
            <div className="w-1/4 h-full p-8 overflow-auto from-purple-400 via-pink-500 to-red-500 text-white">
                <CustomTextField
                    title="Тип проверки знаний"
                    placeholder="Введите тип проверки знаний, к примеру Суммативное оценивание"
                    value={customTitle}
                    onChange={handleCustomTitleChange}
                />
                <CustomTextField
                    title="Тема"
                    placeholder="Введите тему"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                <CustomTextField
                    title="Цель обучения"
                    placeholder="Введите цель обучения"
                    value={learningObjective}
                    onChange={(e) => setLearningObjective(e.target.value)}
                />
                <CustomTextField
                    title="Критерий оценивания"
                    placeholder="Введите критерий оценивания"
                    value={evaluationCriteria}
                    onChange={(e) => setEvaluationCriteria(e.target.value)}
                />
                <CustomTextField
                    title="Уровень мыслительных навыков"
                    placeholder="Введите уровень мыслительных навыков"
                    value={thinkingSkillsLevel}
                    onChange={(e) => setThinkingSkillsLevel(e.target.value)}
                />
                <CustomTextField
                    title="Время выполнения"
                    placeholder="Введите время выполнения"
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                />
            </div>
        </div >
    );
};

export default BotInterface;
