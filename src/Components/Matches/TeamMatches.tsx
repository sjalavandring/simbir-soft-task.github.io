import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Match from './Match'
import { useDispatch, useSelector } from 'react-redux';
import { RootStateType } from '../../store/store';
import Paginator from '../Paginator/Paginator';

//Компонент высшего порядка, возвращающий 
export default function TeamMatches() {
    const dispatch = useDispatch()
    const currentTeamPage = useSelector((state: RootStateType) => state.teamsInfoReducer.currentTeamId)
    const currentTeamMatchesPage = useSelector((state: RootStateType) => state.pagesInfoReducer.teamPage)
    const [matchesInfo, setMatchesInfo] = useState([])

    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>('');
    const [maxPagesCount, setMaxPagesCount] = useState<any>(1)
    const [dataLoadingStatus, setLoadingStatus] = useState<string>('Данные загружаются')
    const maxElementsOnPage = 7;

    // useEffect(() => {
    //     console.log(currentTeamPage)
    // }, [currentTeamPage])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/v4/teams/${currentTeamPage}/matches`, {
                    headers: {
                    'X-Auth-Token': process.env.REACT_APP_API_KEY,
                    },
                });

                setMaxPagesCount(Math.ceil(response.data.matches.length / maxElementsOnPage))

            } catch (error) {
                console.error('Error fetching data:', error);
                setLoadingStatus('Нет доступа к данным')
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/v4/teams/${currentTeamPage}/matches`, {
                    headers: {
                    'X-Auth-Token': process.env.REACT_APP_API_KEY,
                    },
                });

                setMaxPagesCount(Math.ceil(response.data.matches.length / maxElementsOnPage))
                setMatchesInfo(response.data.matches);
                setMatchesInfo((matchesInfo) => matchesInfo.slice(((currentTeamMatchesPage) * maxElementsOnPage) , (currentTeamMatchesPage + 1) * maxElementsOnPage))
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoadingStatus('Нет доступа к данным')
            }
        };

        fetchData();
    }, [currentTeamMatchesPage]);

    useEffect(() => {
        if (startDate && endDate) {
          const fetchData = async () => {
            try {
              const response = await axios.get(`/v4/teams/${currentTeamPage}/matches/?dateFrom=${startDate}&dateTo=${endDate}`, {
                headers: {
                  'X-Auth-Token': process.env.REACT_APP_API_KEY,
                },
              });
              
            
              dispatch({ type: "changeTeamListPageTo", newPage: 0 });
              setMaxPagesCount(Math.ceil(response.data.matches.length / maxElementsOnPage))
              setMatchesInfo(() => response.data.matches.slice(((currentTeamMatchesPage) * maxElementsOnPage) , (currentTeamMatchesPage + 1) * maxElementsOnPage))
              console.log(matchesInfo, ((currentTeamMatchesPage) * maxElementsOnPage),(currentTeamMatchesPage + 1) * maxElementsOnPage)
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          };
      
          fetchData();
        }
    }, [startDate, endDate]);

    const onPageChange = (newPage: number) => {
        if ((newPage >= 0) && (newPage < maxPagesCount) && (newPage != currentTeamMatchesPage)) {
            console.log(`Switched to page ${newPage + 1}`);
            dispatch({ type: "changeTeamListPageTo", newPage: newPage });
        }
    };  

    let breadcrumbsPath = "Команды/Название команды".split('/')
    return (
        <div className="matches-content container">
            <div className="breadcrumbs">

                {breadcrumbsPath.map((item: string, index: number) => (
                    index < breadcrumbsPath.length - 1 ?
                    <React.Fragment>
                        <div className="breadcrumbs__item">{item}</div>
                        <div className="breadcrumbs__item">&gt;</div>
                    </React.Fragment> :
                    <div className="breadcrumbs__item">{item}</div>
                ))}

            </div>
            <div className="matches">

                <h2 className="matches-title">Матчи</h2>
                <div className="matches-date">
                    <label htmlFor="startDate">с</label>
                    <input id="startDate" className="date__date-picker" type="date" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value)}/>

                    <label htmlFor="endDate">по</label>
                    <input id="endDate" className="date__date-picker" type="date" onChange={(event: any) =>  setEndDate(event.target.value)}/>
                </div>
                <ul className="matches-list">
                    {
                        matchesInfo.length > 0 ?  matchesInfo.map((matchInfo: any, index: number) => <Match matchInfo={matchInfo} />) : <li>{dataLoadingStatus}</li>  
                    }
                </ul>
                <Paginator pageCount={maxPagesCount} currentPage={currentTeamMatchesPage} onPageChange={onPageChange}/>
            </div>
        </div>
    )
}
