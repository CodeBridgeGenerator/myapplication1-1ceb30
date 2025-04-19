import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";


const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
      if (Object.hasOwnProperty.call(errorObj.errors, key)) {
        const element = errorObj.errors[key];
        if (element?.message) {
          errMsg[key] = element.message;
        }
      }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error : errorObj.message} : {};
};

const InvoicesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [companyId, setCompanyId] = useState([])
const [item, setItem] = useState([])

    useEffect(() => {
        let init  = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [companyId,item], setError);
        }
        set_entity({...init});
        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
        
        if (!ret) setError(error);
        return ret;
    }

    const onSave = async () => {
        if(!validate()) return;
        let _data = {
            companyId: _entity?.companyId?._id,item: _entity?.item?._id,subTotal: _entity?.subTotal,total: _entity?.total,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            
        const result = await client.service("invoices").create(_data);
        const eagerResult = await client
            .service("invoices")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[result._id]}, $populate : [
                {
                    path : "companyId",
                    service : "companies",
                    select:["name"]},{
                    path : "item",
                    service : "items",
                    select:["details"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Create info", message: "Info Invoices updated successfully" });
        props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.log("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
            props.alert({ type: "error", title: "Create", message: "Failed to create in Invoices" });
        }
        setLoading(false);
    };

    

    

    useEffect(() => {
                    // on mount companies
                    client
                        .service("companies")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleCompaniesId } })
                        .then((res) => {
                            setCompanyId(res.data.map((e) => { return { name: e['name'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Companies", type: "error", message: error.message || "Failed get companies" });
                        });
                }, []);

useEffect(() => {
                    // on mount items
                    client
                        .service("items")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleItemsId } })
                        .then((res) => {
                            setItem(res.data.map((e) => { return { name: e['details'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Items", type: "error", message: error.message || "Failed get items" });
                        });
                }, []);

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const companyIdOptions = companyId.map((elem) => ({ name: elem.name, value: elem.value }));
const itemOptions = item.map((elem) => ({ name: elem.name, value: elem.value }));

    return (
        <Dialog header="Create Invoices" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="invoices-create-dialog-component">
            <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="companyId">CompanyId:</label>
                <Dropdown id="companyId" value={_entity?.companyId?._id} optionLabel="name" optionValue="value" options={companyIdOptions} onChange={(e) => setValByKey("companyId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["companyId"]) ? (
              <p className="m-0" key="error-companyId">
                {error["companyId"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="item">Item:</label>
                <Dropdown id="item" value={_entity?.item?._id} optionLabel="name" optionValue="value" options={itemOptions} onChange={(e) => setValByKey("item", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["item"]) ? (
              <p className="m-0" key="error-item">
                {error["item"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="subTotal">Sub Total:</label>
                <InputNumber id="subTotal" className="w-full mb-3" mode="currency" currency="MYR" locale="en-US" value={_entity?.subTotal} onValueChange={(e) => setValByKey("subTotal", e.value)}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["subTotal"]) ? (
              <p className="m-0" key="error-subTotal">
                {error["subTotal"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="total">Total:</label>
                <InputNumber id="total" className="w-full mb-3" mode="currency" currency="MYR" locale="en-US" value={_entity?.total} onValueChange={(e) => setValByKey("total", e.value)}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["total"]) ? (
              <p className="m-0" key="error-total">
                {error["total"]}
              </p>
            ) : null}
          </small>
            </div>
            <small className="p-error">
                {Array.isArray(Object.keys(error))
                ? Object.keys(error).map((e, i) => (
                    <p className="m-0" key={i}>
                        {e}: {error[e]}
                    </p>
                    ))
                : error}
            </small>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(InvoicesCreateDialogComponent);
