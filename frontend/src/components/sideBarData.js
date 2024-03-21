import React from "react";

import * as AiIcons from 'react-icons/ai'
import * as FaIcons from 'react-icons/fa'
import * as IoIcons from 'react-icons/io'
import * as GiIcons from 'react-icons/gi'
import * as TbIcons from 'react-icons/tb'
import * as GoIcons from 'react-icons/go'

export const sideBarData = [
    {
        title: 'Home',
        path: '/',
        icon: <AiIcons.AiFillHome/>,
        cName: 'nav-text'
    },
    {
        title: 'Expenses',
        path: '/expenses',
        icon: <GiIcons.GiTakeMyMoney/>,
        cName: 'nav-text'
    },
    {
        title: 'Income',
        path: '/income',
        icon: <GiIcons.GiReceiveMoney/>,
        cName: 'nav-text'
    },
    {
        title: 'Budgets',
        path: '/budget',
        icon: <TbIcons.TbRulerMeasure/>,
        cName: 'nav-text'
    },
    {
        title: 'Goals',
        path: '/goal',
        icon: <GoIcons.GoGoal/>,
        cName: 'nav-text'
    },
]