/***********************/
/*     About Page     */
/***********************/
// Simple page to display info about Trails

import React from 'react';
import { MDBAccordion, MDBAccordionItem } from 'mdb-react-ui-kit';

const AboutPage = (props: any) => {
	return (
        <div className='about-page'>
            <div>
                <MDBAccordion initialActive={1}>
                    <MDBAccordionItem collapseId={1} headerTitle='What is Trails?'>
                        <ul>
                            <li>Trails is an educational tool to help expose users to new projects.</li>
                            <li>We provide guidance in digestible steps and videos to make it easy on you.</li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={2} headerTitle='What’s in it for me?'>
                        <ul>
                            <li>We do the hard work of curating a list of the most promising projects and providing TLDRs on what makes them special to save you time and effort.</li>
                            <li>Through this process of exploring new projects, it also puts you in position for airdrops.</li>
                            <li>It also puts you in better position to qualify for paid “expeditions”.</li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={3} headerTitle='What is coming on the expeditions page?'>
                        <ul>
                            <li>To provide additional incentives, projects will be able to subsidize activities taken on their platform.</li>
                            <li>Only specific wallets will qualify based on criteria that we develop with the project.</li>
                            <li>Similar to a very targeted marketing campaign.</li>
                            <li>Payouts can vary based on previous activity for that wallet.</li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={4} headerTitle='What does the XP earn?'>
                        <ul>
                            <li>Puts you in a better position for expeditions.</li>
                            <li>Also a proxy for your “airdrop hunter” score.</li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={5} headerTitle='How do I get my project listed on Trails?'>
                        <ul>
                            <li>Reach out on Twitter <a target={'_blank'} href='https://twitter.com/TrailsProtocol'>@TrailsProtocol</a></li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={5} headerTitle='Transaction is "too old"?'>
                        <ul>
                            <li>Only transactions within 5 days and after you first connected your wallet on Trails are valid</li>
                        </ul>
                    </MDBAccordionItem>
                    <MDBAccordionItem collapseId={6} headerTitle='Who is on the team?'>
                        <ul>
                            <li><a target={'_blank'} href='https://twitter.com/MilesFinched'>Michael Dillon</a> is a Solana analyst. He has experience building projects on Solana, including <a target={'_blank'} href='https://twitter.com/poolprops'>@PoolProps</a> which placed 4th in the Solana Summer Camp Hackathon.</li>
                            <li><a target={'_blank'} href='https://twitter.com/runkellen'>Kellen Blumberg</a> is a developer and data scientist. He has extensive modeling user activity on-chain and building predictive behavior models.</li>
                        </ul>
                    </MDBAccordionItem>
                </MDBAccordion>
            </div>
        </div>
	);
}

export default AboutPage;