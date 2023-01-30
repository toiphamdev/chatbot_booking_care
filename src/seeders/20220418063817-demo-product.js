'use strict';

const IMAGE_APPETIZES = "https://static.wixstatic.com/media/d253bb_d7bf67d93e8d4e158e0939683cd521c5~mv2.jpg/v1/fill/w_863,h_576,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d253bb_d7bf67d93e8d4e158e0939683cd521c5~mv2.jpg";
const IMAGE_PEARS = "https://static.wixstatic.com/media/d253bb_4119d27fe09e47bdad26873867dcd102~mv2.jpg/v1/fill/w_707,h_478,al_c,lg_1,q_80,enc_auto/d253bb_4119d27fe09e47bdad26873867dcd102~mv2.jpg";
const IMAGE_CHICKEN = "https://lescordonbleus.ch/wp-content/uploads/2013/11/chavez01.jpg";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Product', [{
      "title": "Món khai vị:",
      "subtitle": "Đa dạng với hơn 30 món ăn theo phong cách Âu, Việt.",
      "image_url": IMAGE_APPETIZES,
      "payload": "VIEW_APPETIZES",
    },
    {
      "title": "Lê hầm rượu vang",
      "subtitle": "Lê hầm rượu vang là một món tráng miệng đặc sắc từ hương, vị tới màu sắc, là một trong những món ăn được chào đón nhiều tại các nhà hàng Âu.",
      "image_url": IMAGE_PEARS,
      "payload": "VIEW_PEARS",
    },
    {
      "title": "Gà Cordon Bleu",
      "subtitle": " Được trang trí trên những chiếc đĩa trắng muốt sang trọng, thường ăn kèm với măng tây.",
      "image_url": IMAGE_CHICKEN,
      "payload": "VIEW_CHICKEN",
    }

    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
