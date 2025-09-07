<template>
	<div class="learning_re">
		<div class="l_title">
			<h1 class="hot_l">热门编程语言</h1>
			<span class="l_update">
				排行来自TIOBE，更新于：{{ this.Now_date }}
			</span>

		</div>

		<div class="programming_language">
			<div class="box" :class="{ active: activeBox === 'Top1' }" id="Top1_programming_lg"
				@mouseover="handleMouseOver('Top1')">
				<h1>TOP1</h1>
				<div class="t1_l_info">

					<div class="t1_l_name">
						<img src="../../assets/fire.gif" style="height: 30px; width: 30px; text-align: left">
						Python
					</div>
					<div class="Rating_Change">Rating:18.04% Change:+4.71%</div>
				</div>
				<div class="content">
					{{ truncateContent(Top1Content) }}
				</div>
				<div class="bt_model">
					<button class="learning_bt"></button>

				</div>

			</div>
			<div class="box" :class="{ active: activeBox === 'Top2' }" id="Top2_programming_lg"
				@mouseover="handleMouseOver('Top2')">
				<h1>TOP2</h1>
				<div class="t2_l_info">
					<div class="t2_l_name">
						<img src="../../assets/fire.gif" style="height: 30px; width: 30px; text-align: left">
						C++
					</div>
					<div class="Rating_Change">Rating:10.04% Change:-0.59%</div>
				</div>
				<div class="content">
					{{ truncateContent(Top2Content) }}
				</div>
				<div class="bt_model">
					<button class="learning_bt"></button>
				</div>
			</div>
			<div class="box" :class="{ active: activeBox === 'Top3' }" id="Top3_programming_lg"
				@mouseover="handleMouseOver('Top3')">
				<h1>TOP3</h1>
				<div class="t3_l_info">
					<div class="t3_l_name">
						<img src="../../assets/fire.gif" style="height: 30px; width: 30px; text-align: left">
						C
					</div>
					<div class="Rating_Change">Rating:9.17% Change:-2.24%</div>
				</div>
				<div class="content">
					{{ truncateContent(Top3Content) }}
				</div>
				<div class="bt_model">
					<button class="learning_bt"></button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				pg_width: "",
				pg_height: "",
				Now_date: "2024-08",
				Top1Key: "",
				Top2Key: "",
				Top3Key: "",
				activeBox: 'Top1',
				maxContentLength: 100,
				Top1Content: 'Python由荷兰计算机科学家Guido vanRossum（吉多·范罗苏姆）于1989年圣诞节期间设计并开始编写其解释器。Python的命名灵感并非来自蟒蛇，而是来源于Guido喜欢的电视剧《蒙提·派森的飞行马戏团》。Python广泛应用于Web开发（如Django、Flask框架）、数据科学与人工智能（NumPy、Pandas、TensorFlow、PyTorch等工具库）、自动化与脚本编程、教育与学习等多个领域。',
				Top2Content: 'C++是由Bjarne Stroustrup教授在1983年于贝尔实验室创立的一种高级编程语言。C++的前身是“C with Classes”，旨在将Simula 67的数据抽象概念引入C语言。C++不仅可用于系统软件、嵌入式系统、驱动程序等底层开发，还广泛应用于游戏引擎（如UnrealEngine、Unity中的C++脚本）、大型应用软件、高性能计算等领域。',
				Top3Content: 'C语言诞生于1970年代初，最初是作为Unix操作系统的系统实现语言而设计的。它以无类型的B语言为基础，经过发展形成了今天的C语言。C语言广泛用于底层系统开发、驱动程序编写、嵌入式软件开发、高性能计算等领域。许多现代编程语言（如C++、Java、JavaScript等）都深受C语言的影响。',
			};
		},
		methods: {
			handleMouseOver(box) {
				this.activeBox = box;
			},
			truncateContent(content) {
				if (content.length > this.maxContentLength) {
					return content.substring(0, this.maxContentLength) + "...";
				} else {
					return content;
				}
			},
		},
	}
</script>

<style lang="scss" scoped>
	.learning_bt {
		position: relative;
		background-color: transparent;
		border: none;
		font-size: 16px;
		color: white;
		cursor: pointer;
		transition: color 0.3s ease;
		background-color: #f0f4ff;
		border-radius: 20px;
		/* Rounded corners */
		padding: 10px 20px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		/* Subtle shadow for depth */
	}

	.learning_bt::after {
		content: '>';
		font-size: 20px;
		color: black;
		transition: content 0.3s ease, font-size 0.3s ease;
	}

	.box.active .learning_bt::after {
		content: '前往学习';
		font-size: 16px;
	}

	.learning_re {
		width: 80%;
		height: auto;
		padding-bottom: 2%;
		border-radius: 19px;
		box-shadow: 0 0 5px 1px #999;
		margin: 0 auto;

		.l_title {
			display: flex;
			flex-wrap: nowrap;
			flex-direction: column;
			justify-content: flex-start;

			.hot_l {
				padding-top: 2%;
				margin-left: 5%;
				width: 30%;
				order: 0;
				text-align: left;
			}

			.l_update {
				width: 30%;
				margin-left: 5%;
				text-align: left;
				order: 1;
			}
		}

		.programming_language {
			padding-top: 2%;
			display: flex;
			flex-wrap: nowrap;
			margin: 0 auto;
			width: 90%;
			gap: 10px;

			/* 子div之间的间隔 */
			.box {
				background-image: url("https://campus.sf-express.com/upload/oss/static/web/mask.png");
				-webkit-transition: width .9s;
				transition: width .9s, transform 0.5s;
				display: flex;
				align-items: flex-start;
				justify-content: flex-start;
				flex-wrap: wrap;
				position: relative;
				height: 350px;
			}

			//#t1_l_name, #t2_l_name, #t3_l_name {
			//  flex-wrap: wrap;
			//}

			.box h1 {
				margin: 15px;
				//margin-left: 15px;
				font-family: PingFangSC-Medium;
				font-size: 28px;
				color: #fff;
				font-weight: 700;
				height: 10%;
			}

			#Top1_programming_lg {
				width: 40%;
				border-radius: 30px;
				display: flex;
				flex-wrap: nowrap;
				flex-direction: column;
				justify-content: flex-start;
			}

			#Top2_programming_lg,
			#Top3_programming_lg {
				width: 30%;
				border-radius: 30px;
				display: flex;
				flex-wrap: nowrap;
				flex-direction: column;
				justify-content: flex-start;
			}

			.box.active {
				width: 40% !important;
			}

			.box:not(.active) {
				width: 30% !important;
			}

			.t1_l_name,
			.t2_l_name,
			.t3_l_name {
				//margin: 15px;
				text-align: left;
				font-family: PingFangSC-Regular;
				font-size: 18px;
				color: #fff;
				font-weight: 600;
			}

			.t1_l_info,
			.t2_l_info,
			.t3_l_info {
				margin-left: 15px;
				margin-bottom: 1%;
				height: 10%;
			}

			.Rating_Change {
				text-align: left;
				font-family: PingFangSC-Regular;
				font-size: 16px;
				color: #fff;
				font-weight: 300;
			}

			.content {
				font-family: PingFangSC-Regular;
				font-size: 15px;
				color: #fff;
				line-height: 30px;
				font-weight: 500;
				margin: 15px;
				text-align: left;
				overflow: hidden;
				height: 62%;
			}

			.bt_model {
				margin: 15px;
				height: 18%;
			}

		}
	}
</style>