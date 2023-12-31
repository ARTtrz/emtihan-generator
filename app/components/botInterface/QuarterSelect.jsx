import React from 'react';
import Select from 'react-select';

const QuarterSelect = ({ classData, selectedSubject, selectedClass, selectedQuarter, setSelectedQuarter, changeQuarter }) => {
    const quarterOptions = Object.keys(classData[selectedSubject]?.[selectedClass] || {}).map((quarter) => ({
        value: quarter,
        label: quarter,
    }));

    return (
        <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">Выберите четверть обучения:</h2>
            <Select
                onChange={(e) => {
                    if (e) {
                        setSelectedQuarter(e.value);
                        changeQuarter(e.value);
                    } else {
                        setSelectedQuarter(null);
                        changeQuarter(null);
                    }
                }}
                className="w-full mt-4 text-black"
                placeholder="Выберите четверть"
                options={quarterOptions}
                isDisabled={!selectedClass}
                isClearable
                isSearchable
            />
        </div>
    );
};

export default QuarterSelect;
