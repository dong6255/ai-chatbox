// import { time } from "console";

//create by ms 20220830
function orgCode(){
    let codes = {
        '2100':'辽宁公安警务信息综合应用平台',
        '2101':'沈阳公安警务信息综合应用平台',
        '2102':'大连公安警务信息综合应用平台',
        '2103':'鞍山公安警务信息综合应用平台',
        '2104':'抚顺公安警务信息综合应用平台',
        '2105':'本溪公安警务信息综合应用平台',
        '2106':'丹东公安警务信息综合应用平台',
        '2107':'锦州公安警务信息综合应用平台',
        '2108':'营口公安警务信息综合应用平台',
        '2109':'阜新公安警务信息综合应用平台',
        '2110':'辽阳公安警务信息综合应用平台',
        '2111':'盘锦公安警务信息综合应用平台',
        '2112':'铁岭公安警务信息综合应用平台',
        '2113':'朝阳公安警务信息综合应用平台',
        '2114':'葫芦岛公安警务信息综合应用平台',
        '2115':'辽河公安警务信息综合应用平台',
    }
    return codes;
}
function setCurTitle(){
    let curPlaceId = sessionStorage.getItem("curPlaceId");
      // console.log(curPlaceId);
	   if(curPlaceId){
        let shortPlaceId = curPlaceId.slice(0, 4);
        // console.log(shortPlaceId);
        let orgTitle = this.orgCode()[`${shortPlaceId}`];
        let arr = {};
        if(orgTitle){
          arr = {
              orgTitle:orgTitle,
              shortPlaceId:shortPlaceId
          }
        }else{
          arr = {
              orgTitle:this.orgCode()['2100'],
              shortPlaceId:2100
          }
        }
        return arr;
      }else{
        return null;
      }
}
function timeFormat(timeStamp) {
  let datetime;
  if(!timeStamp){
    timeStamp = new Date();
  }
  datetime = new Date(timeStamp);
  console.log(datetime);
  let year = datetime.getFullYear();
  let month =datetime.getMonth() + 1 < 10? "0" + (datetime.getMonth() + 1): datetime.getMonth() + 1;
  let date =datetime.getDate() < 10? "0" + datetime.getDate(): datetime.getDate();
  let hh =datetime.getHours() < 10? "0" + datetime.getHours(): datetime.getHours();
  let mm =datetime.getMinutes() < 10? "0" + datetime.getMinutes(): datetime.getMinutes();
  let ss =datetime.getSeconds() < 10? "0" + datetime.getSeconds(): datetime.getSeconds();
  let week = datetime.getDay();
  let weeks = ["日","一","二","三","四","五","六"];
  let getWeek = "星期" + weeks[week];
  let timedata = {'year':year,'month':month,'date':date,'hh':hh,'mm':mm,'ss':ss,'week':getWeek};
  return timedata;
}

/**
 *
 * @param {需要转换的图片file} file
 * @param {是否返回压缩后的base64} isCompression
 * @param {转换成功后通过回调函数将结果返回} callback
 */
 function imageToBase64(file, isCompression, callback) {
  console.log(file);
	// 判断图片类型
  var isJpg;
	if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/jpg') {
		isJpg = true
	} else {
		jsJpg = false
	}

	// 判断图片大小
	const isLt2M = file.size / 1024 / 1024 < 2
	if (!isJpg) {
		this.$message.error('上传图片只能是jpg/png/jepg格式')
	}
	// if (!isLt2M) {
	// 	this.$message.error('上传图片大小不能超过2M')
	// }

	// 创建一个HTML5的FileReader对象
	var reader = new FileReader()
	// 创建一个img对象
	var img = new Image()
	// let filename = file.filename
	if (file) {
		reader.readAsDataURL(file)
	}
	if (isJpg && isLt2M) {
		reader.onload=(e)=>{
			// let base64Str = reader.result.split[','][1]
			img.src = e.target.result
			// base64地址图片加载完毕后执行
			img.onload = function() {
				// 缩放图片需要canvas（也可以在DOM中直接定义canvas标签，这样就能把压缩完的图片不转base64也能直接显示出来）
				var canvas = document.createElement('canvas')
				var context = canvas.getContext('2d')
				// 图片原始尺寸
				var originWidth = this.width
				var originHeight = this.height
				// 最大尺寸限制，可通过设置宽高来实现图片压缩程度
				var maxWidth = 300,
					maxHeight = 300
				// 目标尺寸
				var targetWidth = originWidth,
					targetHeight = originHeight
				// 图片尺寸超过最大尺寸限制
				if(originWidth > maxWidth || originHeight > maxHeight) {
					if (originWidth / originHeight > maxWidth / maxHeight) {
						// 更改宽度，按照宽度限定尺寸
						targetWidth = maxWidth
						targetHeight = Math.round(maxWidth*(originHeight/originWidth))
					} else {
						targetHeight = maxHeight
						targetWidth = Math.round(maxHeight*(originWidth/originHeight))
					}
				}
				// 对图片进行缩放
				canvas.width = targetWidth
				canvas.height = targetHeight
				// 清除画布
				context.clearRect(0, 0, targetWidth, targetHeight)
				/** 图片压缩
				 * 第一个参数是创建的img对象
				 * 第二三个参数是左上角坐标
				 * 后两个参数是画布区域宽高
				 */
				context.drawImage(img, 0, 0, targetWidth, targetHeight)
				/** 压缩后的base64文件
				 * 第一个参数可以为image/jpeg或image/webp类型的图片
				 * 第二个参数设置图片质量取值0-1，超出则以默认值0.92替代
				 */
				var newUrl = canvas.toDataURL('image/jpeg', 0.02)
				if (isCompression) { // 返回压缩后的base64
					return callback(newUrl)
				} else { // 返回不压缩的base64
					return callback(e.target.result)
				}
			}
		}
	}
}

export default {
    orgCode,setCurTitle,timeFormat,imageToBase64
}
