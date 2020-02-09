import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    // schema validation

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    });
  }
}

export default new RecipientController();
