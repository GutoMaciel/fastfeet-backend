import * as Yup from 'yup';
// import { startOfDay, endOfDay, parseISO, getHours } from 'date-fns';
import File from '../models/File';
import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';

class DeliverymanFunctionalities {
  async update(req, res) {
    // when he deliver the package, he should be able to send a image and fill the signature_id field: OK
    const schema = Yup.object().shape({
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

    // check if the package was started: OK
    if (!actualPackage.start_date) {
      return res.status(400).json({ error: 'Delivery not started yet' });
    }

    // check if the package was canceled:OK
    if (actualPackage.start_date || actualPackage.canceled_at) {
      return res.status(400).json({ error: 'Delivery already closed' });
    }

    const { end_date } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'You must provide your signature' });
    }

    const { originalname: name, filename: path } = req.file;

    const signatureFile = await File.create({ name, path });

    const updatedPackage = await actualPackage.update({
      end_date,
      signature_id: signatureFile.id,
    });

    return res.json(updatedPackage);
  }
}

export default new DeliverymanFunctionalities();
