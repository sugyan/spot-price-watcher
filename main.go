package main

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"log"
	"time"
)

func init() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

func main() {
	service := ec2.New(session.New(), &aws.Config{Region: aws.String("ap-northeast-1")})
	result, err := service.DescribeRegions(nil)
	if err != nil {
		log.Fatal(err)
	}
	for _, region := range result.Regions {
		func(region *string) {
			log.Print(*region)
			service = ec2.New(session.New(), &aws.Config{Region: region})

			query := &ec2.DescribeSpotPriceHistoryInput{
				InstanceTypes: []*string{
					aws.String("g2.2xlarge"),
				},
				ProductDescriptions: []*string{
					aws.String("Linux/UNIX"),
				},
				StartTime: aws.Time(time.Now()),
			}
			resp, err := service.DescribeSpotPriceHistory(query)
			if err != nil {
				log.Fatal(err)
			}
			log.Print(resp)
		}(region.RegionName)
	}
}
