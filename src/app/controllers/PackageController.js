import * as Yup from 'yup';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Recipient from '../models/Recipient';

class PackageController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!checkDeliveryman) {
      return res.status(400).json({
        error: 'This deliveryman was not found or he is not available',
      });
    }

    const checkRecipient = await Recipient.findByPk(recipient_id);

    if (!checkRecipient) {
      return res.status(400).json({ error: 'This recipient was not found' });
    }

    const newPackage = await Package.create(req.body);

    // send email to deliveryman

    return res.json(newPackage);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      deliveryman_id: Yup.number(),
      recipient_id: Yup.number(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { id } = req.params;

    const actualPackage = await Package.findByPk(id);

    if (!actualPackage) {
      return res.status(400).json({ error: 'This package was not found' });
    }

    // const { recipient_id, deliveryman_id } = req.body;

    // const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    // if (!checkDeliveryman) {
    //   return res.status(400).json({
    //     error: 'This deliveryman was not found or not available',
    //   });
    // }

    // const checkRecipient = await Recipient.findByPk(recipient_id);

    // if (!checkRecipient) {
    //   return res.status(400).json({ error: 'This recipient was not found' });
    // }

    const updatedPackage = await actualPackage.update(req.body);

    return res.json(updatedPackage);
  }

  async index(req, res) {
    const allPackages = await Package.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'complement',
            'number',
            'city',
            'state',
            'zip',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(allPackages);
  }

  async show(req, res) {
    const { id } = req.params;

    const actualPackage = await Package.findByPk(id, {
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zip',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'name', 'path'],
        },
      ],
    });

    if (!actualPackage) {
      return res.status(400).json({ error: 'This package was not found' });
    }

    return res.json(actualPackage);
  }
}

export default new PackageController();
