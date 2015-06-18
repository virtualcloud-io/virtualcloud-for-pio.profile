
        </div>
      </div>

    </div>


    {% if invite %}

      <div class="ui two column centered grid">
        <div class="column">

          <div class="ui icon message">
            <i class="add user icon"></i>
            <div class="content">
              <div class="header">
                Invite someone to this VirtualCloud!
              </div>
              <p>Copy the url and code below and send them to another party using a different channel of communication for each.</p>

              <div class="ui attached form">

                <div class="two fields">
                  <div class="ten wide field">
                    <label>Token</label>
                    <input value="{{invite.token}}" readonly="readonly" type="text">
                  </div>
                  <div class="six wide field">
                    <label>Code</label>
                    <input value="{{invite.code}}" readonly="readonly" type="text">
                  </div>
                </div>

              </div>


            </div>
          </div>

        </div>
      </div>
        
    {% endif %}



    <div class="ui hidden divider"></div>

    <div class="ui basic center aligned segment">
      <p>Open Source: <a href="https://github.com/virtualcloud-io/genesis.virtualcloud.io">github.com/virtualcloud-io/genesis.virtualcloud.io</a></p>
    </div>



<form action="/login" method="POST">
    <input type="hidden" name="repository" value="REPOSITORY"/>
    <input type="hidden" name="branch" value="BRANCH"/>
    <input type="hidden" name="rootSecretHash" value="ROOT_SECRET_HASH"/>
    <input type="hidden" name="publicKeyFingerprint" value="PUBLIC_KEY_FINGERPRINT"/>

    <input type="submit" class="ui submit button">Submit</input>
</form>



    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://code.jquery.com/jquery.js"></script>
    <!-- Include all compiled plugins (below), or include individual files as needed -->
    <script src="/lib/semantic-ui-css/semantic.min.js"></script>
    <script src="/main.js"></script>
  </body>
</html>
