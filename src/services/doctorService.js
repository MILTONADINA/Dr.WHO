const { Doctor, Actor, Episode } = require('../models');

class DoctorService {
  async createDoctor(data) {
    return await Doctor.create(data);
  }

  async getAllDoctors() {
    return await Doctor.findAll({
      include: [
        { model: Actor, as: 'actor' },
        { model: Episode, as: 'firstEpisode' },
        { model: Episode, as: 'lastEpisode' }
      ]
    });
  }

  async getDoctorById(id) {
    return await Doctor.findByPk(id, {
      include: [
        { model: Actor, as: 'actor' },
        { model: Episode, as: 'firstEpisode' },
        { model: Episode, as: 'lastEpisode' }
      ]
    });
  }

  async updateDoctor(id, data) {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    return await doctor.update(data);
  }

  async deleteDoctor(id) {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    return await doctor.destroy();
  }
}

module.exports = new DoctorService();

