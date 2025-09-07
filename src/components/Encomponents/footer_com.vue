<template>
  <footer>
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section about">
          <h3>关于我们</h3>
          <p>TLONLINEP。</p>
        </div>
        <div class="footer-section links">
          <h3>快速链接</h3>
          <ul>
            <li><a href="#">首页</a></li>
            <li><a href="#">课程</a></li>
            <li><a href="#">学习资源</a></li>
            <li><a href="#">联系我们</a></li>
          </ul>
        </div>
        <div class="footer-section contact">
          <h3>联系我们</h3>
          <p>邮箱: e******@***********</p>
          <p>电话: 123-456-7890</p>
        </div>
        <div class="footer-section social">
          <h3>社交媒体</h3>
          <a href="#"><i class="fab fa-facebook-f"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>版权所有 &copy; 2025 TLONLINEP。保留所有权利。</p>
      </div>
    </div>
  </footer>

</template>


<style lang="scss" scoped>
footer {
  background-color: #333;
  color: #fff;
  padding: 20px 0;
  width: 100%;
  //margin-top: 30px;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
}

.footer-section {
  flex: 1;
  margin: 0 20px;

  h3 {
    border-bottom: 2px solid #fff;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 5px;

      a {
        color: #fff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .social a {
    display: inline-block;
    color: #fff;
    margin-right: 10px;
    font-size: 20px;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }
  }
}

.footer-bottom {
  width: 100%;
  text-align: center;
  margin-top: 20px;

  p {
    font-size: 12px;
  }
}

</style>
<script setup lang="ts">
</script>
