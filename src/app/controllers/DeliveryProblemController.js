import DeliveryProblem from '../models/DeliveryProblem';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryProblemController {
  async index(req, res) {
    // list every problem of any package for admins
    const allProblems = await DeliveryProblem.findAll({
      order: ['id'],
    });

    return res.json(allProblems);
  }

  async show(req, res) {
    // list the problems of an specific package for deliverymans
    const { id } = req.params;

    const problematicPackage = await Package.findByPk(id);

    if (!problematicPackage) {
      return res.status(400).json({ error: 'Package was not found' });
    }

    const problems = await DeliveryProblem.findAll({
      where: {
        package_id: id,
      },
      attributes: ['id', 'description'],
      include: [
        {
          model: Package,
          as: 'package',
          attributes: ['product', 'start_date', 'end_date', 'canceled_at'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                'number',
                'complement',
                'state',
                'city',
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
                  attributes: ['name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(problems);
  }

  async store(req, res) {
    // subscribe a new problem of an package

    const { id } = req.params;

    const problematicPackage = await Package.findByPk(id);

    if (!problematicPackage) {
      return res.status(400).json({ error: 'Package not found' });
    }

    if (problematicPackage.cenceled_at) {
      return res.status(400).json({ error: 'Delivery already cancaled' });
    }

    const { description } = req.body;

    const problemReport = await DeliveryProblem.create({
      package_id: id,
      description,
    });

    return res.json(problemReport);
  }

  async destroy(req, res) {
    const problem = await DeliveryProblem.findByPk(req.params.id);

    if (!problem) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    // set canceled_at at the package status: OK
    const actualPackage = await Package.findByPk(problem.package_id);

    await actualPackage.update({ canceled_at: new Date() });

    // send and email to the deliveryman telling that the delivery was canceled

    await problem.destroy();

    return res.json({ deleted: true });
  }
}

export default new DeliveryProblemController();
