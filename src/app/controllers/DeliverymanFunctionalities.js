import * as Yup from 'yup';
// import { startOfDay, endOfDay, parseISO, getHours } from 'date-fns';
// import File from '../models/File';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
// import Recipient from '../models/Recipient';

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
    // the delivery man can only get 5 packages daily.
    // when he deliver the package, he should be able to send a image and fill the signature_id field.
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation Fails' });
    }

    const { id, package_id } = req.params;

    // const { start_date } = req.body;

    // check deliveryman

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveyrman not found' });
    }

    // check package

    const actualPackage = await Package.findByPk(package_id);

    if (!actualPackage) {
      return res.status(400).json({ error: 'Package not found' });
    }

    // console.log(actualPackage);

    // check package belonging

    if (actualPackage.deliveryman_id !== Number(id)) {
      return res.status(400).json({ error: 'Package does not belongs' });
    }

    const allPackages = await Package.findAll({
      where: {
        deliveryman_id: id,
      },
    });

    // check 5 limit take out daily

    if (allPackages.lenght >= 5) {
      return res.status(400).json({ error: '5 packages daily limit excedd' });
    }

    const updatedPackage = await actualPackage.update(req.body);

    return res.json(updatedPackage);
  }
}

export default new DeliverymanFunctionalities();
