import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Record from '../components/Record';
import RecordPopUp from '../components/RecordPopUp';
import {API_URL} from '../components/Utilities';
import { MethodProvider } from '../context/MethodContext';

const RecordsScreen = () =>  {
    
    //GET PARAMETERS
    //Parameters in url
    const [searchParams] = useSearchParams();
    const budget = searchParams.get('budget') || '';
    const method = searchParams.get('method') || '';
    const type = searchParams.get('type') || '';
    const keyword = searchParams.get('keyword') || '';
    const start_date = searchParams.get('start_date') || '';
    const end_date = searchParams.get('end_date') || '';
    const limit = searchParams.get('limit') || '';
    const sort = searchParams.get('sort') || '';

    //Hidden parameters
    const location = useLocation();
    const { state } = location;
    const icon = state && state.icon ? state.icon : "fas fa-search";

    // Construct query parameters
    let parameters = "";
    if (budget !== "") {
        parameters += `?apartado=${budget}`;
    }
    if (method !== "") {
        parameters += `${parameters === "" ? "?" : "&"}method=${method}`;
    }
    if (type !== "") {
        parameters += `${parameters === "" ? "?" : "&"}tipo=${type}`;
    }
    if (keyword !== "") {
        parameters += `${parameters === "" ? "?" : "&"}keyword=${keyword}`;
    }
    if (start_date !== "") {
        parameters += `${parameters === "" ? "?" : "&"}start_date=${start_date}`;
    }
    if (end_date !== "") {
        parameters += `${parameters === "" ? "?" : "&"}end_date=${end_date}`;
    }
    if (limit !== "") {
        parameters += `${parameters === "" ? "?" : "&"}limit=${limit}`;
    }
    if (sort !== "") {
        parameters += `${parameters === "" ? "?" : "&"}sort=${sort}`;
    }


    //GET RECORDS
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/NEWlistRecords.php${parameters}`,{
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    }
                });
                const searchData = response.data;
                setRecords(searchData.records);
                setSummary(searchData.summary);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, [parameters]);


    //DELETE RECORD FROM UI
    const handleDelete = (recordId) => {
        
        setRecords(records.filter(record => record.id !== recordId)); // Remove the deleted record from the state

    };


    //POP UP
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [popupMode, setPopupMode] = useState(null);

    //Open for new record in popup
    const handleNewRecordClick = () => {
        setPopupVisible(true);
        setPopupMode('new');

        const date = new Date();
        //This because the time was coming in UTD, to transform to CST
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        // Transforms the date in the right format YYYY-MM-DDTHH:MM
        const formatedDate = localDate.toISOString().slice(0, 16); 
        
        setSelectedRecord({
            cantidad: '',
            apartado: budget, 
            descripcion: '',
            method: method,
            tipo: 'gasto',
            fecha_mov: formatedDate
        });
    };
    
    //Open existing record in pop up
    const handleRecordClick = (record) => {
        setPopupVisible(true);
        setPopupMode('update');

        setSelectedRecord(record);
    };

    // Function to handle record update from popup
    const handlePopupClose = (updatedRecord) => {

        if(popupMode==="update"){
            setRecords(records.map(record =>
                record.id === updatedRecord.id ? updatedRecord : record
            ));
        }
        else if(popupMode==="new"){
            setRecords([updatedRecord, ...records]);
        }

        setSelectedRecord(null);
        setPopupVisible(false);
    };
    

    //NAVEGACION
    const navigate = useNavigate();

    const handleBackToMain = () => {
        navigate('/'); // Navigate to the main page (change '/' to the appropriate route if needed)
    };


  return (
    <div id="movimientos" className='pantalla completa' style={{paddingBottom: '66px'}}>

            {/* Header */}
            <h3 className="apartado"><i className={icon}></i> {keyword} {budget} {method} {type} {start_date}{ start_date?" - ":"" }{end_date} | <span className="saldo">${summary}</span></h3>

            {/* Records list */}
            <MethodProvider>
                <ul id="lista">
                    {records.map(record => (
                        <Record 
                            record={record}
                            onRecordOpen={() => handleRecordClick(record)}
                            onDelete={handleDelete}
                        />
                    ))}
                </ul>
            </MethodProvider>

            {/* Footer */}
            <div className="footer">
                <button className="btn btn-big btn-default mt-2" onClick={handleBackToMain}>Close</button>
                <i className="transaction fas fa-plus-circle" onClick={handleNewRecordClick}></i>
            </div>

            {/* Popup component */}
            {popupVisible && selectedRecord && (
                <RecordPopUp
                    record={selectedRecord}
                    onClose={handlePopupClose}
                    mode={popupMode}
                ></RecordPopUp>
            )}

    </div>
  );
};

export default RecordsScreen;