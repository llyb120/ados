import {AdvanceComponent} from "../component";

export default class $BaseSearchLayout extends AdvanceComponent {

    getBaseSearchLayoutSpan = function (span = 6) {
        return `repeat(${span}, ${100 / span}%)`
    }

    render(h, t, params) {
        const {span} = params
        return  <el-form className="form">
            <div style={{display: "grid", "grid-template-columns": this.getBaseSearchLayoutSpan(span)}}>
                {this.renderSearchForm(h,t, params)}
            </div>
            <div style="text-align: center; margin-top: 20px">
                {this.renderSearchAction(h,t, params)}
            </div>
        </el-form>
    }

    renderSearchForm(h,t,{}) {
        //暂时先用searchFields
        return t.renderSearchForm()
    }

    renderSearchAction(h,t,{}){
        return t.renderSearchAction()
    }




}