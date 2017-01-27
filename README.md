# linter-js-cloudformation-yaml

This is a fork of the `linter-js-yaml` package. It will parse your YAML as well as the newly released CloudFormation YAML files in Atom with [cloudformation-js-yaml-schema](https://github.com/yyolk/cloudformation-js-yaml-schema) through [js-yaml](https://github.com/connec/yaml-js), exposing any issues reported.

Great care has been put into making sure the schema can be updated separately from the linter, since it is changed frequently by AWS. The schema includes the correct YAML type through trial and error since it is not documented by AWS. New tags will be added to the schema, and this package will update in turn. Please feel free to open a PR on [`cloudformation-js-yaml-schema`](https://github.com/yyolk/cloudformation-js-yaml-schema) to gain support if I don't get to it before you do.

## Example

The following template will produce an error: ![cft_error](https://raw.githubusercontent.com/yyolk/linter-js-cloudformation-yaml/master/images/cft_error.png)

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Demo Linux Stack
Metadata:
  AWS::CloudFormation::Interface:
    ParameterGroups:
      -
        Label:
          default: Instance Configuration
        Parameters:
          - LaunchInstance
          - ImageId
          - InstanceType
          - KeyName
          - VolumeSize
Parameters:
  ImageId:
    Type: AWS::EC2::Image::Id
    Default: ami-f173cc91
  InstanceType:
    Type: String
    Default: t2.large
  KeyName:
    Type: AWS::EC2::KeyPair::KeyName
    Default: ec2-keypair
  VolumeSize:
    Type: Number
    Default: 8
  LaunchInstance:
    Default: false
    AllowedValues:
      - true
      - false
Conditions:
  DoLaunchInstance: !Equals !Ref LaunchInstance true  #this will error in linter
Resources:
  LinuxBox:
    Type: AWS::EC2::Instance
    Condition: DoLaunchInstance
    CreationPolicy:
      ResourceSignal:
        Timeout: PT25M
    Metadata:
      AWS::CloudFormation::Init:
        config:
          packages:
            yum:
              htop: []
    Properties:
      InstanceInitiatedShutdownBehavior: stop
      ImageId: !Ref ImageId
      InstanceType: !Ref InstanceType
      KeyName: !Ref KeyName
      IamInstanceProfile: !Ref InstanceProfile
      Monitoring: false
      NetworkInterfaces:
        -
          DeleteOnTermination: true
          Description: !Sub LinuxBox Primary Netint from ${AWS::StackName}
          DeviceIndex: 0
          SubnetId: !Ref InstanceSubnetId
          AssociatePublicIpAddress: false
          GroupSet:
            - !Ref LinuxSecurityGroup
      BlockDeviceMappings:
        -
          DeviceName: /dev/sda1
          Ebs:
            VolumeType: gp2
            DeleteOnTermination: true
            VolumeSize: !Ref VolumeSize
      UserData:
        Fn::Base64: !Sub |
           #!/bin/bash -xe
           yum update -y aws-cfn-bootstrap
           /opt/aws/bin/cfn-init -v --stack ${AWS::StackName} --resource LaunchConfig --region ${AWS::Region}
           /opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource WebServerGroup --region ${AWS::Region}
```

## Installation

```
$ apm install linter-js-cloudformation-yaml
```

## Settings

You can add additional custom tags and configure linter-js-cloudformation-yaml by editing ~/.atom/config.cson (choose Open Your Config in Atom menu) or in Preferences:

```cson
'linter-js-cloudformation-yaml':
  'customTags': [
    "!yaml"
    "!include"
  ]
```

- `customTags`: List of YAML custom tags. (Default: scalar)
