<template>
  <div class="loginDlPage">
    <div class="loginCenter" v-if="showLogin">
      <div class="loginL">
        <img class="loginBg1" src="../../assets/login_dlbg1.png" alt="" />
        <img class="loginBg2" src="../../assets/login_dlbg2.png" alt="" />
        <img class="loginBg3" src="../../assets/login_dlbg3.png" alt="" />
      </div>
      <div class="loginR">
        <div class="loginBox" :style="{ paddingBottom: !isOnline && 0 }">
          <div class="loginTitle">欢迎登录<span v-if="!isXjz" style="color:red">培训平台</span></div>
          <el-form
            v-if="isPswLogin"
            :model="loginValues"
            ref="loginForm"
            :rules="rules"
          >
            <el-form-item prop="userName" class="login_user">
              <el-input
                placeholder="请输入用户名"
                type="text"
                v-model="loginValues.userName"
                @keyup.enter.native="handleLogin()"
              ></el-input>
            </el-form-item>
            <el-form-item prop="passWord" class="login_psw">
              <el-input
                placeholder="请输入密码"
                type="password"
                v-model="loginValues.passWord"
                autocomplete="off"
                @keyup.enter.native="handleLogin()"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="keyBox" v-if="!isPswLogin">
            <span>请插入专用的Ukey进行登录</span>
          </div>
          <el-button class="login_btn" @click="handleLogin" :loading="loginLoad">登 录</el-button>
          <div class="switch_wrapper" v-show="isOnline">
            <span class="login_switch" @click="switchLogin(isPswLogin)">{{
              isPswLogin ? "数字证书登录" : "用户名密码登录"
            }}</span>
            <span class="login_register" @click="registerUser(true)"
              >新用户注册</span
            >
          </div>

        </div>
      </div>
    </div>
    <div class="loginCenter" v-else>
      <div class="registerWrapper">
        <div class="registerBox">
          <div class="registerTitle">新用户注册</div>
          <el-form
            :model="staffInfo"
            ref="staffInfo"
            :rules="staffRules"
            label-width="100px"
          >
            <el-row :loading="insertLoading">
              <el-col :span="12">
                <el-form-item label="用户账号" prop="userid">
                  <el-input
                    v-model="staffInfo.userid"
                    placeholder="请输入身份证号"
                    :disabled="staffFlag"
                    maxLength="18"
                    clearable
                    @blur="checkSfzh()"
                    @input="
                      (val) => {
                        staffInfo.userid = val.replace(/([^0-9Xx])+/g, '');
                      }
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户姓名" prop="username">
                  <el-input v-model="staffInfo.username" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="警号" prop="alarm">
                  <el-input v-model="staffInfo.alarm" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户性别" prop="menuSys">
                  <AsyncSelect
                    :value="staffInfo.sex"
                    :optionList="xbOptionList"
                    style="width: 100%"
                    @change="(value) => (staffInfo.sex = value)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出生日期" prop="birthday">
                  <limit-time-picker
                    :value="staffInfo.birthday"
                    dateType="date"
                    style="width: 100%"
                    @change="(value) => (staffInfo.birthday = value)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="mobilephone">
                  <el-input
                    v-model="staffInfo.mobilephone"
                    maxLength="11"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="座机" prop="telephone">
                  <el-input
                    v-model="staffInfo.telephone"
                    maxLength="11"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="行动电话" prop="actionTelephone">
                  <el-input
                    v-model="staffInfo.actionTelephone"
                    maxLength="11"
                    clearable
                  />
                </el-form-item>
              </el-col> -->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="人员类别" prop="category">-->
<!--                  <AsyncSelect-->
<!--                    :value="staffInfo.category"-->
<!--                    :optionList="rylbOptionList"-->
<!--                    style="width: 100%"-->
<!--                    @change="(value) => (staffInfo.category = value)"-->
<!--                  />-->
<!--                </el-form-item>-->
<!--              </el-col>-->
              <el-col :span="24">
                <el-form-item label="所属部门" prop="orgid">
                  <DepartTree
                    type="object"
                    :pageType="pageType"
                    :value="staffInfo.orgid"
                    :registerUser="true"
                    style="width: 100%"
                    @select="(value) => (staffInfo.orgid = value.id)"
                  ></DepartTree>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="bz">
                  <el-input
                    type="textarea"
                    v-model="staffInfo.bz"
                    clearable
                    :autosize="{ minRows: 2, maxRows: 3 }"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <div style="text-align: center">
              <el-button type="cancel" @click="registerUser(false)"
                >取消</el-button
              >
              <el-button
                type="primary"
                @click="submitForm"
                :loading="insertLoading"
                >提交</el-button
              >
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <div class="loginTip">
      <!-- <span style="font-size:18px" v-if="isXjz">维护中心热线：<span>13889860290</span></span> -->
      <span class="down" @click="downloadResource">资源下载</span>
      <span class="down" @click="oldLink">原警综链接</span>
      <span class="down" @click="newLink">培训平台</span>
      <span class="down" @click="openFc">公安应用方舱</span>
      <span class="down" @click="openZf">公安执法知识库</span>
    </div>
    <DialogInfo
      :visible="visible"
      title="新版浏览器下载"
      width="560px"
      @onOk="handleDownLoad"
      @onCancel="handleCancel"
      :loading="loading"
    >
      <template v-slot:content>
        <div>请选择下载浏览器版本：</div>
        <div class="radio-wrapper">
          <el-radio v-model="checkRadio" label="32bat">32位系统</el-radio>
          <el-radio v-model="checkRadio" label="64bat" style="margin-left: 10px"
            >64位系统</el-radio
          >
        </div>
      </template>
    </DialogInfo>
  </div>
</template>

<script>
import DialogInfo from "../../components/DialogInfo/DialogInfo";
import pnxclient from "@/utils/pnxclient";
import AsyncSelect from "../../components/AsyncSelect/AsyncSelect";
import DepartTree from "../../components/DepartTree/DepartTree";
import LimitTimePicker from "../../components/LimitTimePicker/LimitTimePicker";
import { isCorrectSfzh, checkTel } from "../../utils/methods";
import msComm from "../../../static/map/ms_comm.js";
export default {
  name: "Login",
  components: { DialogInfo, AsyncSelect, DepartTree, LimitTimePicker },
  data() {
    return {
      loginValues: {
        userName: "",
        passWord: "",
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        passWord: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      isPswLogin: false,
      loginLoad: false,
      //新版浏览器下载弹窗
      visible: false,
      loading: false,
      checkRadio: "32bat",
      //切换登录和注册页面
      showLogin: true,
      insertLoading: false,
      xbOptionList: [
        {
          id: "1",
          itemValue: "1",
          itemName: "男",
        },
        {
          id: "2",
          itemValue: "2",
          itemName: "女",
        },
      ],
      rylbOptionList: [
        {
          id: "0",
          itemValue: "0",
          itemName: "民警",
        },
        {
          id: "1",
          itemValue: "1",
          itemName: "辅警",
        },
      ],
      staffInfo: {
        userid: "",
        username: "",
        alarm: "",
        sex: "",
        birthday: "",
        mobilephone: "",
        telephone: "",
        // category: "",
        bz: "",
        orgid: "",
      },
      staffRules: {
        userid: [
          { required: true, message: "请输入用户账号", trigger: "blur" },
        ],
        username: [
          { required: true, message: "请输入用户姓名", trigger: "blur" },
        ],
        alarm: [{ required: true, message: "请输入警号", trigger: "blur" }],
        mobilephone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern:
              /(^([0][1-9]{1}[0-9]{1,2}[-]?)?\d{7,8}(-\d{1,4})?$)|(^[1][3|4|5|6|7|8|9]{1}\d{9}$)/,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
        // category: [
        //   { required: true, message: "请选择人员类别", trigger: "change" },
        // ],
        orgid: [
          { required: true, message: "请选择所属部门", trigger: "change" },
        ],
      },
      staffFlag: true,
      isOnline: true,
      pageType:'loginDl',
      isXjz:false
    };
  },
  methods: {
    // 资源下载
    downloadResource() {
      window.open(window.downloadUrl);
    },
    newLink(){
      window.open('http://www.pxjzpt.ln/index.html')
    },
    oldLink(){
      window.open('http://29.2.1.174:9080/jwzh')
    },
    openFc(){
      window.open('http://yyfc.ln:80')
    },
    openZf(){
      window.open('http://11.33.25.216:81/ydzk/home')
    },
    async handleDownLoad(){
      let url = "http://29.40.1.40/google/Setup64.exe";
      if  (this.checkRadio == "32bat")  {
        url = "http://29.40.1.40/google/Setup32.exe";
      }
      await this.download(url);
    },
    handleCancel() {
      this.visible = false;
      this.checkRadio = "32bat";
    },
    download(url) {
      let href = url;
      let downloadElement = document.createElement("a");
      downloadElement.href = href;
      downloadElement.download = "新版浏览器";
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);
      this.visible = false;
    },
    // 登录
    handleLogin() {
      const that = this;
      if(that.isPswLogin){
      that.$refs.loginForm.validate(valid => {
        if (valid) {
          that.loginLoad = true;
          Common.httpRequest({
            url: `${SeuSysDict.sys_host.managePath}/login`,
            params: {
              username: that.loginValues.userName,
              password: that.loginValues.passWord
            },
            success(res) {
              //modify by ms 20220830
              sessionStorage.setItem("curPlaceId", res.data.rows[0].placeId);
              sessionStorage.setItem("userId", res.data.rows[0].userId);
              let curT = msComm.setCurTitle();
                if(curT&&curT.orgTitle){
                  document.title = curT.orgTitle;
                }
              //modify by ms end
              sessionStorage.setItem("loginName", that.loginValues.userName);
              that.$emit("handleLogin",res)
              that.loginLoad = false;
            },
            fail() {
              that.loginLoad = false;
            }
          });
        }
      })
      }else{
         // 参数说明：initParam：vctk控件初始化参数
      	 // var initParam = "<\?xml version=\"1.0\" encoding=\"utf-8\"\?><authinfo><liblist><lib type=\"CSP\" version=\"1.0\" dllname=\"ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"PM\" version=\"1.0\" dllname=\"Q3J5cHRPY3guZGxs\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IFN0cm9uZyBDcnlwdG9ncmFwaGljIFByb3ZpZGVy\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RW50ZXJTYWZlIGVQYXNzMzAwMyBDU1AgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"SklUIFVTQiBLZXkgQ1NQIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RW50ZXJTYWZlIGVQYXNzMjAwMSBDU1AgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"SklUIFVTQiBLZXkzMDAzIENTUCB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEJhc2UgQ3J5cHRvZ3JhcGhpYyBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RkVJVElBTiBlUGFzc05HIFJTQSBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXI=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RkVJVElBTiBlUGFzc05HIENTUCBGb3IgSklUM0sgVjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"U2h1dHRsZUNzcDExXzMwMDBHTS5kbGw=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib></liblist></authinfo>";
      	//  let initParam = "<\?xml version=\"1.0\" encoding=\"utf-8\"\?><authinfo><liblist><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTU19GIENyeXB0b2dyYXBoaWMgU2VydmljZSBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTUyBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXIgdjEuMA==\" ><algid val=\"SHA1\" sm2_hashalg=\"sm3\"/></lib><lib type=\"PM\" version=\"1.0\" dllname=\"Q3J5cHRPY3guZGxs\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IFN0cm9uZyBDcnlwdG9ncmFwaGljIFByb3ZpZGVy\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RW50ZXJTYWZlIGVQYXNzMzAwMyBDU1AgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"SklUIFVTQiBLZXkgQ1NQIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RW50ZXJTYWZlIGVQYXNzMjAwMSBDU1AgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"SklUIFVTQiBLZXkzMDAzIENTUCB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEJhc2UgQ3J5cHRvZ3JhcGhpYyBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RkVJVElBTiBlUGFzc05HIFJTQSBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXI=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"RkVJVElBTiBlUGFzc05HIENTUCBGb3IgSklUM0sgVjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"U2h1dHRsZUNzcDExXzMwMDBHTS5kbGw=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1\" dllname=\"R0FLRVlfU0tGLmRsbA==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib></liblist></authinfo>";
            let initParam = "<\?xml version=\"1.0\" encoding=\"utf-8\"\?><authinfo><liblist><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX21pcHM2NC5zby4wLjMuMTAuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9taXBzNjQuc28uMC4zLjExLjA0MTM=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9hcm02NC5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX3g4Nl82NC5zby4wLjMuMTAuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQUZfYXBpX3g4Ni5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfeDg2XzY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9hcm02NC5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQUZfYXBpX3g4Ni5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfeDg2XzY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfbWlwczY0LnNvLjAuMy40LjkyMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy45LjAyMjU=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMS4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTUyBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"R0FLRVlfU0tGLmRsbA==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTU19GIENyeXB0b2dyYXBoaWMgU2VydmljZSBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"R0FGS0VZX1NLRi5kbGw=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib></liblist></authinfo>";         
           
            Common.httpRequest({
            
            url: `${SeuSysDict.sys_host.managePath}/jwzh/openApi/random`,
            params: {},
            success({ data }) {
            	let authContent = data.rows[0];
            	if(authContent == ""){
		            alert("认证原文不能为空!");
		            return false;
		        }else{
		            try{
		                pnxclient.JIT_GW_ExtInterface.GetVersion();
                    console.log("版本号"+pnxclient.JIT_GW_ExtInterface.GetVersion());
		            }catch(e){
		                alert("未安装控件，请进行安装控件");
		                return false;
		            }
		            pnxclient.JIT_GW_ExtInterface.ClearFilter();
		            // 初始化vctk控件
		            pnxclient.JIT_GW_ExtInterface.Initialize("",initParam);
		            // 控制证书为一个时，不弹出证书选择框
		            pnxclient.JIT_GW_ExtInterface.SetChooseSingleCert(1);

		            // 生成签名信息
		            let sign_Result = pnxclient.JIT_GW_ExtInterface.P7SignString(authContent,true,true);
		            if(pnxclient.JIT_GW_ExtInterface.GetLastError() !=0){
		                if (pnxclient.JIT_GW_ExtInterface.GetLastError() == 3758096386
		                    || pnxclient.JIT_GW_ExtInterface.GetLastError() == 2148532334){
		                    alert("用户取消操作");
		                    return;
		                }else if (pnxclient.JIT_GW_ExtInterface.GetLastError() == -536870815
		                    || pnxclient.JIT_GW_ExtInterface.GetLastError() == 3758096481) {
		                    alert("没有找到有效的证书，如果使用的是KEY，请确认已经插入key");
		                    return;
		                }else{
		                    alert(pnxclient.JIT_GW_ExtInterface.GetLastErrorMessage());
		                    return;
		                }
		            }
		          // 返回签名结果
		          if(sign_Result){
                Common.httpRequest({
                  url: `${SeuSysDict.sys_host.managePath}/jwzh/openApi/pkiLogin`,
                  params: {
                    signed_data:sign_Result,
                    original_vue:authContent,
                  },
                  success(res) {
                    //modify by ms 20220830
                    sessionStorage.setItem("curPlaceId", res.data.rows[0].placeId);
                    sessionStorage.setItem("userId", res.data.rows[0].userId);
                    let curT = msComm.setCurTitle();
                    if(curT&&curT.orgTitle){
                      document.title = curT.orgTitle;
                    }
                    //modify by ms end
                    sessionStorage.setItem("loginName", that.loginValues.userName);
                    that.$emit("handleLogin", res)
                    that.loginLoad = false;
                  },
                  fail(res) {
                    that.loginLoad = false;
                    if (res.data.code === 201) {
                      that.staffInfo.userid = res.data.rows[0].sfzh;
                      that.staffInfo.username = res.data.rows[0].xm;
                      that.registerUser(true);
                      that.staffFlag = true;
                    }
                  }
                });
              }
            }
          },
          fail() {
            that.loginLoad = false;
          }
        });
      }
    },
    switchLogin(param) {
      if (param) {
      }
      this.isPswLogin = !param;
    },
    registerUser(isShow) {
      if (isShow) {
        if (this.$refs.loginForm) {
          this.$nextTick(() => {
            this.$refs.loginForm.clearValidate();
          });
        }
        this.loginValues = this.$options.data().loginValues;
        this.showLogin = false;
      } else {
        if (this.$refs.staffInfo) {
          this.$nextTick(() => {
            this.$refs.staffInfo.clearValidate();
          });
        }
        this.staffInfo = this.$options.data().staffInfo;
        this.staffFlag = false;
        this.showLogin = true;
      }
    },
    checkSfzh() {
      if (!isCorrectSfzh(this.staffInfo.userid)) {
        this.$message({
          type: "error",
          message: "请输入正确的身份证号！",
        });
      }
    },
    submitForm() {
      this.$refs.staffInfo.validate((valid) => {
        if (valid) {
          if (!isCorrectSfzh(this.staffInfo.userid)) {
            this.$message({
              type: "error",
              message: "请输入正确的身份证号！",
            });
            return;
          }
          if (!checkTel(this.staffInfo.mobilephone)) {
            this.$message({
              type: "error",
              message: "请输入正确的手机号！",
            });
            return;
          }
          const that = this;
          that.insertLoading = true;
          Common.httpRequest({
            url: `${SeuSysDict.sys_host.managePath}/orgUser/pkiRegister`,
            params: { ...this.staffInfo },
            success(response) {
              const code = response.data.code;
              if (code == 200) {
                that.$message({
                  message: `注册成功！请等待管理员审核通过之后进行登录。`,
                  type: "success",
                });
                that.registerUser(false);
              }
              that.insertLoading = false;
            },
            fail() {
              that.insertLoading = false;
            },
          });
        }
      });
    },
  },
  mounted() {
    const that = this;
    let str = location.href.substr(-14)
    if(str == 'logintype=yycs'){
      that.switchLogin(that.isPswLogin);
    }
    if (
      window.location.href.includes("www.dl") ||
      window.location.href.includes("www.ln")
    ) {
      this.isOnline = true;
    }else if(window.location.href.includes("www.xjwzh.ln")){
      this.isOnline = false;
      this.isXjz = true;
      document.onkeydown = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        // e.preventDefault()
        // e.stopPropagation()
        if (e.altKey && e.key === "q" && window.isAdminLogin === "true") {
          // 按 Esc
          that.switchLogin(that.isPswLogin);
        }
      };
    } else {
      this.isOnline = false;
      document.onkeydown = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        // e.preventDefault()
        // e.stopPropagation()
        if (e.altKey && e.key === "s" && window.isAdminLogin === "true") {
          // 按 Esc
          that.switchLogin(that.isPswLogin);
        }
      };
    }
  },

};
</script>
<style lang="scss" scoped>
html,
body,
.el-container,
.loginDlPage {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.loginDlPage {
  position: relative;

  background-image: url("../../assets/liaoning/login_dlbg.png");
  background-size: cover;
  background-origin: revert;
  background-position: center;
  position: relative;
  .loginCenter {
    position: absolute;
    top: 0;
    left: 0;
    margin: 5% 15%;
    width: 70%;
    height: 80%;
    display: flex;
    background-repeat: no-repeat;
    justify-content: center;
    .loginL {
      width: 45%;
      height: 100%;
      min-width: 450px;
      position: relative;
      background-size: 43% auto;
      background-repeat: no-repeat;
      background-position: 95% 38%;
      background-image: url("../../assets/login_dlbg4.png");
      .loginBg1 {
        width: 45%;
        height: auto;
        position: absolute;
        top: 32%;
        left: 16%;
        z-index: 10;
      }
      .loginBg2 {
        width: 65%;
        height: auto;
        position: absolute;
        top: 24%;
        left: 6%;
        animation: circle 8s linear infinite;
      }
      .loginBg3 {
        width: 73%;
        height: auto;
        position: absolute;
        top: 21%;
        left: 2%;
        animation: circle 3s linear infinite;
      }
    }
    .loginR {
      width: 25%;
      height: 100%;
      display: flex;
      align-items: center;
      min-width: 360px;
      .loginBox {
        background-image: url("../../assets/login_dlbox.png");
        background-size: 98% auto;
        background-repeat: no-repeat;
        background-position: center;
        width: 100%;
        height: 40%;
        padding: 50px;
        margin-top: 5%;
        .loginTitle {
          font-size: 20px;
          font-weight: 400;
          color: #ffffff;
          text-align: center;
          margin-bottom: 10%;
          letter-spacing: 1px;
        }
        .el-form {
          .login_user,
          .login_psw {
            height: 40px;
            margin-bottom: 7%;
            background: #00224c;
            border: 1px solid rgba(67, 108, 196, 0.17);
            background-size: 20px 22px;
            background-position: 10px 50%;
            background-repeat: no-repeat;
          }
          .login_user {
            background-image: url("../../assets/login_user.png");
          }
          .login_psw {
            background-image: url("../../assets/login_psw.png");
          }
          >>> .el-form-item__content,
          .el-input {
            height: 100%;
          }
          >>> .el-input__inner {
            width: calc(100% - 30px);
            height: 100%;
            background: transparent;
            border: none !important;
            color: #fff;
            font-size: 14px;
            letter-spacing: 1px;
            margin-left: 30px;
          }
          >>> .el-form-item__error {
            font-size: 14px;
            color: red;
          }
        }
        .keyBox {
          width: 100%;
          height: 66px;
          font-weight: 400;
          color: #ffffff;
          margin: 5% auto 10%;
          background: rgba(36, 52, 71, 0);
          border: 1px solid #3478ff;
          border-radius: 6px;
          background-image: url("../../assets/login_key.png");
          background-size: auto 50%;
          background-position: 7% 50%;
          background-repeat: no-repeat;
          display: flex;
          justify-content: center;
          align-items: center;
          span {
            padding-left: 15%;
            letter-spacing: 1px;
          }
        }
        .login_btn {
          height: 15%;
          width: 100%;
          margin: 5% auto 8%;
          font-size: 18px;
          font-weight: 400;
          text-align: center;
          background: #3478ff;
          color: #fff;
          border: none;
        }
        .switch_wrapper {
          display: flex;
          justify-content: space-around;
        }
        .login_switch,
        .login_register {
          font-weight: 400;
          text-align: center;
          text-decoration: underline;
          color: #0162c5;
          line-height: 26px;
          cursor: pointer;
        }
        .login_switch:hover,
        .login_register:hover {
          color: #fff;
        }
      }
    }
    .registerWrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      min-width: 720px;
      max-width: 960px;
      .registerBox {
        background-color: rgba(255, 255, 255, 1);
        width: 100%;
        padding: 30px;
        border-radius: 15px;
        margin-top: 45px;
        .registerTitle {
          font-size: 20px;
          font-weight: 600;
          color: #006eff;
          text-align: center;
          letter-spacing: 1px;
          margin-bottom: 40px;
        }
      }
    }
  }
  .loginTip {
    font-weight: 400;
    line-height: 30px;
    color: #ffffff;
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    text-align: center;
    z-index: 1000;
    .down {
      padding: 0 30px;
      text-decoration: underline;
      cursor: pointer;
      font-size:18px;
    }
    .down:hover {
      color: #fff;
    }
    .contact {
      text-decoration: underline;
      cursor: pointer;
    }
    .contact:hover {
      color: #fff;
    }
  }
  @keyframes circle {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
.radio-wrapper {
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 15px;
}
>>> .el-radio__label {
  font-size: 14px;
}
</style>
