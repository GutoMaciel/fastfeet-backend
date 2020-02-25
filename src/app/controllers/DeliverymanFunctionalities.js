import * as Yup from 'yup';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';

class DeliverymanFunctionalities {
  async index(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman was not found' });
    }

    const delivery = await Package.findAll({
      where: {
        deliveryman_id: req.params.id,
      },
    });

    return res.json(delivery);
  }

  async update(req, res) {
    // allow deliveryman get a package and update the start_date(when he get the package) and end_date(when he finally delivery the package to the final customer.)
    // the delivery man can only get 5 packages daily. OK
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation Fails' });
    }

    const { id, package_id } = req.params;

    // check deliveryman: OK
    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveyrman not found' });
    }

    // check package: OK
    const actualPackage = await Package.findByPk(package_id);

    if (!actualPackage) {
      return res.status(400).json({ error: 'Package not found' });
    }

    // check package belonging: OK
    if (actualPackage.deliveryman_id !== Number(id)) {
      return res.status(400).json({ error: 'Package does not belongs' });
    }

    const allPackages = await Package.findAll({
      where: {
        deliveryman_id: id,
      },
    });

    // check 5 limit take out daily: OK
    if (allPackages.lenght >= 5) {
      return res.status(400).json({ error: '5 packages daily limit excedd' });
    }

    // check start date: OK
    if (actualPackage.canceled_at) {
      return res.status(400).json({ error: 'Delivery already closed' });
    }

    const updatedPackage = await actualPackage.update(req.body);

    return res.json(updatedPackage);
  }
}

export default new DeliverymanFunctionalities();
