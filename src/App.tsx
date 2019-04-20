import React, { Component } from 'react';
import logo, { ReactComponent } from './logo.svg';
import './App.css';
import {Button, Icon, Upload, Row} from 'antd';
import * as Axios from "axios";
import { stringify } from 'querystring';
import Table from './components/table';
import { randomBytes } from 'crypto';

class App extends React.Component<any, any> {

  constructor(props){
      super(props)
      this.state = {
          data: {
            12: {
                1: {

                },
                2: {

                }
            },
            14: {
                1: {

                },
                2: {
                    
                }
            }
          }
      }
  }

  getIntersection = (t: any, key: string, columnItemId: string) => {
    try{
        return this.state.data[t.id][columnItemId][key];
    }
    catch{
        return '';
    }
  }

  render() {

    const sets = {
        projects: {
            data: async () => {
                return [
                    {
                        "id": 1,
                        "title": "Projecto 1",

                    },
                    {
                        "id": 2,
                        "title": "Projecto 2"
                    },
                ]
            },
            key: 'project',
            itemKey:'id',
            itemText: 'title',
            title: 'Project',
            render: i => i.title,
            children: [{
                key: 'title',
                itemKey: "id",
                itemText: 'title',
                children: [{
                    key: "ID",
                    itemKey: 'id',
                    title: "ID",
                },
                {
                    key: "IT",
                    itemKey: 'id',
                    title: "IT"
                }]
            }]
        },
        sex: {
            data: async () => {
                return [
                    {
                        id: 1,
                        title: "Male"
                    },{
                        id: 2,
                        title: "Female"
                    }
                ]
            },
            key: "sex",
            itemKey: 'id',
            itemText: "title",
            title: "Sex",
            render: i => i.title,
            children: [
                {
                    key: 'sex',
                    itemKey: "id",
                    itemText: 'title',
                }
            ]
        },
        
        employees: {
            data: async () => {
                return [{
                    id: 12,
                    name: "Javier"
                },
                {
                    id: 14,
                    name: "Dargys"
                }]
            },
            key: "employee",
            itemKey: 'id',
            itemText: 'name',
            title: "Employee",
            render: (t) => t.name
        }
    };

    return (
      <div className="App">
        <Table 
            intersect={this.getIntersection} 
            onChange={(i, col, columnItemId, val) => {
                this.state.data[i.id][columnItemId][col] = val;

                this.setState({data: {...this.state.data}});
            }}
            row={'employees'}
            sets={sets} />
      </div>
    );
  }
}

export default App;
