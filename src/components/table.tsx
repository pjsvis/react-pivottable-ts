
import * as React from 'react';
import {Row, Col, Table, Tree, Checkbox, Input, Button, Select} from 'antd';
import { isArray } from 'util';


export interface IDataGridProps<T> {
   intersect: (item: any, colKey: string, columnItemId: string) => string;
   onChange: (item: any, colKey: string, columnItemId: string, value: string) => void;
   sets: {
       [id: string]:SpaceMap<any>
   };
   row: string;
}



export interface SpaceMap<T> {
    data: (searchString?: string) => Promise<T[]>;
    key: string;
    itemKey: string;
    title: string;
    children?: SubMap<T>[];
    render?: (record: T) => React.ReactNode | string;
    itemText: string;
}

export interface SubMap<T>{
    itemKey: string;
    key: string;
    itemText?: string;
    title?: string;
    renderer?: (item: T) => React.ReactNode | string;
    children?: SubMap<T>[];

}

export interface IDataGridState<T>{
    row: string;
    def: {
        rows: any[],
    },
    columns: {

    },
    loading: boolean;
}

interface PivotFilterProps{
    selectedKeys: any[];
    setSelectedKeys: (selected: any) => void;
    data: ((searchQuery?: string) => Promise<any[]>)| any[];
    itemKey: string;
    renderer?: (item: any) => string | React.ReactNode;
    placeholder?:string;
}

interface PivotFilterState{
    data: any[];
    searchQuery: string;
    selectedKeys: any[];
    
}

interface PivotColumnTableProps {
    map: SpaceMap<any>;
    intersect: (item: any, colKey: string) => void;
    onFilter: (keys: string[]) => void;
    data: any[];
}

export class PivotFilter extends React.Component<PivotFilterProps, PivotFilterState>{

    constructor(props: any){
        super(props);

        this.state = {
            data: [],
            searchQuery: '',
            selectedKeys: this.props.selectedKeys || []
        }
    }

    componentDidMount(){
        this.load();
    }

    load = () => {
        if(!isArray(this.props.data))
            (this.props.data as any)(this.state.searchQuery).then(result => {
                this.setState({data: result.map(i => new Object(i))})
            })
        else
            this.setState({data: this.props.data});
    }


    handleKeys = (keys: any[]) => {
        this.setState({selectedKeys: [...keys]})
        this.props.setSelectedKeys(keys.map(i => i.key));
    }

    isActive = (key) => {
        return !!this.state.selectedKeys.find(i => i == key)
    }

    render(){
        const filteredOptions = this.state.data;
        const propName = this.props.itemKey;

        console.log(this.state.data);

        return (<div style={{padding: 10}} className="">
           <div style={{marginBottom: 10}}>
                <Select
                    mode="multiple"
                    showSearch
                    placeholder={this.props.placeholder}
                    value={this.state.selectedKeys}
                    onChange={this.handleKeys}
                    labelInValue
                    onSearch={e => this.setState({searchQuery: e}, () => this.load())}
                    style={{ minWidth: '300px' }}
                >
                    {filteredOptions.map(item => (
                    <Select.Option key={item[this.props.itemKey]} value={item[this.props.itemKey]}>
                        {
                            this.props.renderer?
                            this.props.renderer(item):
                            item[this.props.itemKey]
                        }
                    </Select.Option>
                    ))}
                </Select>
            </div>
            <Button 
                type="primary"
                size="small"
                style={{ width: 90, marginRight: 8 }}
                onClick={e => this.handleKeys(this.state.data.map(i => ({key: i[this.props.itemKey]})))}>
                Select all
            </Button>
            <Button 
                size="small"
                style={{ width: 90 }}
                onClick={e => this.handleKeys([])}>
                Deselect all
            </Button>
      </div>);
    }

}

export default class DataGrid<TRow> extends React.Component<IDataGridProps<TRow>, IDataGridState<TRow>>{
    
    constructor(props: any){
        super(props);

        this.state = {
            row: this.props.row,
            def: {
                rows: []
            },
            columns: {

            },
            loading: false
        }

    }

    expand = (setA: {
        data: {}[],
        key: string, 
        itemKey: string
        }, setB: {}[]) => {
        const result: any[] = [];

        if(!setB || setB.length == 0)
            return setA.data.map(i => ({
                ...i,
                [`${setA.key}_${setA.itemKey}`]: i[setA.itemKey]
            }));

        for(var a of setA.data){
            for(var b of setB){
                result.push({
                    ...a, ...b, [`${setA.key}_${setA.itemKey}`]: b[setA.itemKey]
                })
            }
        }

        return result;
    } 

    

    componentDidMount(){
        this.load();
    }

    filterColums = (selected) => {

    }

    load = async () => {
        
        this.setState({loading: true});

        let rows: any[] = [];
        const columnValues: {
            [id:string]: any[]
        } = {};
        
            
        const rowDef = this.props.sets[this.state.row];
        const data = rowDef.data;
        rows = this.expand(
            {
                data: await data(),
                key: rowDef.key,
                itemKey: rowDef.itemKey
            }, rows);

        
        for(var name in this.props.sets){
            const data = await this.props.sets[name].data();
            this.setState({
                columns: {
                    ...this.state.columns,
                    [name]:{
                        data: data ,
                        selected: data.map(i => i[this.props.sets[name].itemKey]),
                    }
                }
            })
        }
        
        

        this.setState({
            def: {
                rows
            },
            loading: false
        })


    }

    getChildren = (item: any, map: SubMap<any>[], intersect: (item: any, columnKey: string, columnItemId: string) => void, columnItemId: string) => {
        return map.map(i => ({
            title: i.title || (i.renderer? i.renderer(item): item[i.itemText || i.itemKey]),
            dataIndex: `${i.key}_${item[i.itemKey]}`,
            key: `${i.key}_${item[i.itemKey]}`,
            children: i.children? this.getChildren(item, i.children, intersect, columnItemId): undefined,
            render: (text, record, index) => {
                return <Input 
                        className='pivot-cell'
                        style={{
                            margin: 0,
                            padding: -20,
                            border: 0,
                            borderRadius: 0
                        }}
                        onChange={(e) => {
                            this.props.onChange(record, i.key, columnItemId, e.target.value);
                        }}
                        value={this.props.intersect(record, i.key, columnItemId)} 
                    />
            }
        }));
    }
    
    getRowColums = () => {
        const rowDef = this.props.sets[this.state.row];

        const index = `${rowDef.key}_${rowDef.itemKey}`;

        const rowCols: any[] = [];

        rowCols.push({
            key: rowDef.key,
            title: rowDef.title,
            dataIndex: rowDef.itemKey,
            onFilter: (value, record) => record[rowDef.itemKey] == value,
            filterDropdown: ({
                setSelectedKeys, selectedKeys, confirm, clearFilters,
              }) => <PivotFilter 
                        selectedKeys={selectedKeys}
                        data={rowDef.data}
                        itemKey={rowDef.itemKey}
                        renderer={rowDef.render}
                        setSelectedKeys={(keys) => {
                            setSelectedKeys(keys);
                        }}
                        
                 />,
            render: (text, record, index) => {
                return rowDef.render? rowDef.render(record): record[rowDef.itemKey];
            }
        })
        
        return rowCols;
    }

    filterColumns = (keys: any[], columnKey: string) => {
        this.setState({
            columns: {
                ...this.state.columns,
                [columnKey]: {
                    ...this.state.columns[columnKey],
                    selected: [...keys]
                }
            }
        })
    }

    getPivotColumn(name: string, map: SpaceMap<any>){
        const colDef = map

        const newCol: any = {
            title: colDef.title,
            key: colDef.key,
            dataIndex: 'íd',
            children: [],
            filterDropdown: ({
                setSelectedKeys, selectedKeys, confirm, clearFilters,
                }) => <PivotFilter 
                    selectedKeys={this.state.columns[name].selected.map(i => ({key: i}))}
                    data={colDef.data}
                    itemKey={map.itemKey}
                    renderer={colDef.render}
                    setSelectedKeys={(keys) => this.filterColumns(keys, name)}
                    />
        };

        newCol.children = [];

        if(this.state.columns[name])
            for(var item of this.state.columns[name].data){
                if(colDef.children && !!this.state.columns[name].selected.find(i => i == item[colDef.itemKey]))
                    newCol.children.push(...this.getChildren(item, colDef.children, this.props.intersect, item[colDef.itemKey]));
            }

        newCol.width = this.state.columns[name].selected.length == 0? '10px': undefined;

        return newCol;
    }

    getColumns = () => {

        const columns = Object.getOwnPropertyNames(this.props.sets)
        .filter(i => i != this.props.row && !!this.state.columns[i])
        .sort((a, b) => - this.state.columns[a].selected.length + this.state.columns[b].selected.length)
        .map(
            i => {
                return this.getPivotColumn(i, this.props.sets[i]);
            }
        )

        return [...this.getRowColums(), ...columns];
    }

    render(){

        const rowSet = this.props.sets[this.props.row];
        const row = this.props.row;

        if(!this.state.def.rows)
            return null;

        return (<Table
                        bordered
                        loading={this.state.loading}
                        rowKey='id'
                        dataSource={this.state.def.rows}
                        columns={this.getColumns()}
                    />
        );
    }
}