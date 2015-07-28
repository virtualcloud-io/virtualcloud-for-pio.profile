
          </div>

        </div>



      </div>

    {% if vct %}

      <div class="five wide column">

        <h2 class="ui header">Government</h2>
        <p>This <b>Space</b> is <a href="https://en.wiktionary.org/wiki/govern">governed</a> with identical rights by:</p>

        <div class="ui celled list">
          <div class="item">
            <img class="ui avatar image" src="https://avatars3.githubusercontent.com/u/18679?v=3&s=140">
            <div class="content">
              <a class="header">Christoph Dorn <div class="ui tag label">Chief System Architect</div></a>

              <div class="description">
                <p>Availability: <b>Support &amp; Coaching</b></p>
<!--                
                <p>Last Access: <b>5 days ago</b>
                  <button class="mini ui primary button">
                    Contact
                  </button>
                </p>
-->
              </div>
            </div>
          </div>          
        </div>

        <div class="ui hidden divider"></div>

        {% if invite %}
<!--                
          <div class="ui icon message">

            <a class="ui right corner label">
              <i class="add user icon"></i>
            </a>

            <div class="content">
              <div class="header">
                Invite someone to this Virtual Cloud Space!
              </div>
              <p>Copy the <i>temporary invite token</i> and send it to the person you want to <b>invite with identical rights as everyone already present</b>. When they are prompted give them the <i>accompanying unlock code</i> using a different channel of communication (to minimize the risk of third party exposure).</p>

              <div class="ui attached form">

                <div class="two fields">
                  <div class="twelve wide field">
                    <label>Invite Token</label>
                    <input value="{{invite.token}}" readonly="readonly" type="text">
                  </div>
                  <div class="four wide field">
                    <label>Unlock Code</label>
                    <input value="{{invite.code}}" readonly="readonly" type="text">
                  </div>
                </div>

              </div>


            </div>
          </div> 
-->
        {% endif %}

      </div>

    {% endif %}


    <div class="ui hidden divider"></div>


    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://code.jquery.com/jquery.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="lib/semantic-ui-css/semantic.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
