import aws from 'aws-sdk';
import axios from 'axios';
import moment from 'moment';

const ce = new aws.CostExplorer({ region: 'us-east-1' });

export const handler = async (event: any): Promise<void> => {
  const start = moment().subtract(1, 'day').format('YYYY-MM-DD');
  const end = moment().format('YYYY-MM-DD');

  const params = {
    Granularity: 'DAILY',
    TimePeriod: {
      Start: start,
      End: end,
    },
    Metrics: ['UnblendedCost'],
    GroupBy: [
      {
        Type: 'DIMENSION',
        Key: 'SERVICE',
      },
    ],
  };

  const costAndUsage = await ce.getCostAndUsage(params).promise();

  let costResult: Array<{ key: String; amount: string }> = [];

  costAndUsage.ResultsByTime?.forEach((cost) => {
    cost.Groups?.forEach((group) => {
      if (group.Metrics?.UnblendedCost?.Amount !== '0') {
        costResult.push({
          key: group.Keys?.[0] ?? 'Any Service',
          amount: group.Metrics?.UnblendedCost?.Amount ?? '0',
        });
      }
    });
  });

  console.log(costResult);

  let message = `Cost for ${start} to ${end}\n`;
  costResult.forEach((cost) => {
    message += `- ${cost.key}: ${cost.amount}\n`;
  });

  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const TG_BOT_CHAT_ID = process.env.TG_BOT_CHAT_ID;

  await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    chat_id: TG_BOT_CHAT_ID,
    text: message,
  });

  return;
};
