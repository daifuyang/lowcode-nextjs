export const getPageSchema = async (data: any) => {
    const { schema } = data;
    const schemaObj = JSON.parse(schema || '{}');
    const pageSchema = schemaObj?.componentsTree?.[0];
    if (pageSchema) {
      return pageSchema;
    }
    return schema;
  };
  

 export class createState {
    state:any;
    constructor(state = {}) {
      this.state = {...state}
    }
    setState(state:any) {
      this.state = state
    }
    getState() {
      return this.state
    }
  }