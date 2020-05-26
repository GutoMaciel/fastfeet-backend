import * as Yup from 'yup';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation Fail' });
    }

    const { id, name, email } = req.body;

    const checkEmailAvailability = await Deliveryman.findOne({
      where: { email },
    });

    if (checkEmailAvailability) {
      return res.status(400).json({ error: 'This email was already taken' });
    }

    const deliveryman = await Deliveryman.create({
      id,
      name,
      email,
    });

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.json({ error: 'Validation Fail' });
    }
    const { id } = req.params;
    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'This email was already taken' });
      }
    }

    const { name, avatar_id } = deliveryman.update(req.body);

    return res.json({
      deliveryman: {
        id,
        name,
        email,
        avatar_id,
      },
    });
  }

  async index(req, res) {
    const { name } = req.query;
    const { page = 1 } = req.query;

    if (name) {
      const deliveryman = await Deliveryman.findAll({
        where: {
          name: { [Op.iLike]: `%${name}%` },
        },
        order: ['id'],
        limit: 25,
        offset: (page - 1) * 10,
      });

      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman not found.' });
      }

      return res.json(deliveryman);
    }

    const deliverymans = await Deliveryman.findAll({
      limit: 25,
      order: ['id'],
      offset: (page - 1) * 10,
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymans);
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery Man was not Found' });
    }

    return res.json(deliveryman);
  }

  async destroy(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      res.status(400).json({ error: 'Delivery man was not found' });
    }

    await deliveryman.destroy();

    return res.json({ deleted: true });
  }
}

export default new DeliverymanController();
