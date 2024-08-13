import React, { useEffect, useState } from 'react';
import '@telegram-apps/telegram-ui/dist/styles.css';

import { AppRoot, LargeTitle } from '@telegram-apps/telegram-ui';

import Birthdays from './components/Birthdays';
import type { BirthdaysResponse, GroupBirthdayInfo } from './types';

declare global {
  interface Window {
    BOT_BASE_API: string;
    Telegram: any;
  }
}

const BASE_API = window.BOT_BASE_API;

const App = () => {
  const [data, setData] = useState();
  //const [tg, setTg] = useState();

  const [birthdays, setBirthdays] = useState<GroupBirthdayInfo[]>();

  const initializeTelegram = async () => {
    const tg = window.Telegram;

    if (!tg || !tg.WebApp?.initData) {
      console.warn(
        'No Telegram data found - using dummy data for rendering purposes'
      );
      const sampleData = await import('./sampleData.json');
      setBirthdays(sampleData.birthdays as GroupBirthdayInfo[]);
      return;
    }

    tg.WebApp.setBackgroundColor('#eee');

    tg.WebApp.MainButton.text = 'Close';
    tg.WebApp.MainButton.onClick(() => tg.WebApp.close());
    tg.WebApp.MainButton.show();

    //setTg(tg);
    setData(tg.WebApp.initData);
  };

  const requestBirthdayInfo = async (
    data: any /* TODO: type initData*/
  ): Promise<BirthdaysResponse | null> => {
    try {
      const response = await fetch(`${BASE_API}/api/miniapp/birthdays`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    initializeTelegram();
  }, []);

  useEffect(() => {
    async function run() {
      const response = await requestBirthdayInfo(data);
      if (response) {
        setBirthdays(response.birthdays);
      }
    }

    if (data) run();
  }, [data]);

  return (
    <AppRoot>
      <LargeTitle>Birthday Bot</LargeTitle>
      {birthdays && <Birthdays data={birthdays} />}
    </AppRoot>
  );
};

export default App;

/*
<script>
window.addEventListener('DOMContentLoaded', init);


async function init(){
  const tg = window.Telegram.WebApp;

	// TODO themes?
	tg.setBackgroundColor('#eee');

  tg.MainButton.text = 'Close';
  tg.MainButton.onClick(buttonClicked);
  tg.MainButton.show();

  const response = await getBirthdays(tg.initData);
  const responseData = await response.json();

  //log(responseData.birthdays);
  displayBirthdays(responseData.birthdays);
}

function log(str){
  if(typeof str === 'object') str = JSON.stringify(str, null, 2);
  document.querySelector('#console').innerText = str;
}

function buttonClicked(){
  window.Telegram.WebApp.close();
}

async function getBirthdays(data){
	try {
		return await fetch(`${BASE_API}/api/miniapp/birthdays`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({data})
		});
	} catch (e){
		console.error(e);
	}
}

function displayBirthdays(groups){
	const el = document.querySelector('#birthdays');

	for(let g of groups){
		const title = document.createElement('h3');
		title.innerText = `🎂 ${g.groupName} (${g.groupId})`;

		el.appendChild(title);

		const list = document.createElement('ul');

		for(let b of g.birthdays){
			const li = document.createElement('li');
			li.innerText = b.formattedLine;

			list.appendChild(li);
		}

		el.appendChild(list);
	
	}
	

}
*/
