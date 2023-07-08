/************************/
/*     Trails Table     */
/************************/
// A generic table class to display info on Trails

import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';

interface ITrailsTableProps {
    rows: any[];
    header: any;
    tabs: string[];
    headerTab: string;
    topDescriptions: string[];
}

const TrailsTable = (props: ITrailsTableProps) => {

    const [activeTab, setActiveTab] = useState(props.tabs[0]);

    const handleTabClick = (e: any) => {
        setActiveTab(e.target.innerText);
    }

    // if there are any descriptions on the table, we can put them at the top
    const topDescriptions = <div className='light-text'>{
            props.topDescriptions.map( (x: string) => <div>{x}</div>)
        }</div>;

        const tabs = props.tabs.map((tabName: string) => {
        return(
            <div className={`col ${activeTab === tabName ? 'active' : ''}`} onClick={handleTabClick}>
                {tabName}
            </div>
        )
    })

	return (
        <div>
            { topDescriptions }
            <div className='trails-table'>
                <div className='trails-tabs row'>
                    { tabs }
                </div>
                <div className='trails-panel-outer-1'>
                    <div className='trails-panel-outer-2'>
                        <div className='trails-panel-outer-3'>
                            {
                                activeTab === props.headerTab && props.header ? <div className='leaderboard-header'>{props.header}</div> : null
                            }
                            <Table hover>
                                <tbody>
                                    {props.rows}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	);
}

export default TrailsTable;