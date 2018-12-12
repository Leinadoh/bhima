/* global expect, agent */
/* jshint expr : true */

const moment = require('moment');
const helpers = require('../helpers');
const shared = require('./shared');

describe('(/lots/) The lots HTTP API', () => {
  // edit an existing lot
  it('PUT /lots/:uuid update lot label or expiration date', () => {
    const update = {
      label : 'Lot Quinine Updated',
      expiration_date : '2020-12-15',
    };

    return agent.put(`/lots/${shared.lotQuinineUuid}`)
      .send(update)
      .then((res) => {
        expect(res).to.have.status(200);
        return agent.get(`/lots/${shared.lotQuinineUuid}`);
      })
      .then(res => {
        const details = res.body;
        expect(details.label).to.be.equal(update.label);
        expect(formatDate(details.expiration_date)).to.be.equal(update.expiration_date);
      })
      .catch(helpers.handler);
  });
});

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}
